package service

import (
	"context"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html"
	"mime"
	"path"
	"regexp"
	"strconv"
	"strings"
)

// Making the saved site work wherever its folder ends up: opened straight
// from disk (index.html), under VS Code Live Server, or in a subfolder of
// XAMPP's htdocs. Every link and file reference is made relative to the page
// ("../sg/index.html", "../_next/static/..."), since a root-relative "/sg"
// only works at the root of a domain, and a folder link only works where a
// server turns it into index.html.
//
// The pages still run Next.js in the browser (menus, sliders, tabs, the
// calculator), which assumes it's served from the root:
//   - script tags get their full address when the page loads (Next.js's chunk
//     loader compares them with full addresses), and its chunk base path is
//     taken from where the script was loaded;
//   - the page data Next.js embeds (self.__next_f) is rewritten the same way,
//     keeping the byte lengths of its text rows right;
//   - a small script (offlineShim) keeps clicks on links as plain page loads
//     and answers Next.js's page-data requests, which there's no server for.
//
// Fonts are put into the CSS as data: URLs, because browsers refuse font
// files loaded from file:// pages.

// cleanCloudflare removes what Cloudflare adds to pages it serves, which only
// works behind Cloudflare: its analytics beacon (POSTs to /cdn-cgi/rum, a 405
// anywhere else), bot-check scripts, and email obfuscation (emails become
// /cdn-cgi/l/email-protection links decoded by a Cloudflare script); those
// emails are decoded back to plain mailto: links and text.
func cleanCloudflare(text string) string {
	if !strings.Contains(text, "cdn-cgi") && !strings.Contains(text, "cloudflareinsights") && !strings.Contains(text, "__CF$cv$params") {
		return text
	}
	text = cfScriptRe.ReplaceAllStringFunc(text, func(script string) string {
		open := script[:strings.IndexByte(script, '>')+1]
		if strings.Contains(open, "/cdn-cgi/") || strings.Contains(open, "cloudflareinsights.com") ||
			strings.Contains(script, "__CF$cv$params") || strings.Contains(script, "/cdn-cgi/challenge-platform/") {
			return ""
		}
		return script
	})
	// An email on its own (<span>), or a link that is the email (<a>).
	text = cfEmailTagRe.ReplaceAllStringFunc(text, func(m string) string {
		g := cfEmailTagRe.FindStringSubmatch(m)
		email := decodeCFEmail(g[2])
		if email == "" {
			return m
		}
		email = html.EscapeString(email)
		if g[1] == "a" {
			return `<a href="mailto:` + email + `">` + email + `</a>`
		}
		return email
	})
	// A link around other text: the address is in the link itself.
	return cfEmailLinkRe.ReplaceAllStringFunc(text, func(m string) string {
		if email := decodeCFEmail(cfEmailLinkRe.FindStringSubmatch(m)[1]); email != "" {
			return `href="mailto:` + html.EscapeString(email) + `"`
		}
		return m
	})
}

var (
	cfScriptRe    = regexp.MustCompile(`(?s)<script\b[^>]*>.*?</script>`)
	cfEmailLinkRe = regexp.MustCompile(`href="/cdn-cgi/l/email-protection#([0-9a-fA-F]+)"`)
	cfEmailTagRe  = regexp.MustCompile(`<(span|a)\b[^>]*\bdata-cfemail="([0-9a-fA-F]+)"[^>]*>[^<]*</(?:span|a)>`)
)

// decodeCFEmail undoes Cloudflare's email encoding: the first byte is a key
// XORed into each of the others.
func decodeCFEmail(encoded string) string {
	b, err := hex.DecodeString(encoded)
	if err != nil || len(b) < 2 {
		return ""
	}
	out := make([]byte, len(b)-1)
	for i := 1; i < len(b); i++ {
		out[i-1] = b[i] ^ b[0]
	}
	return string(out)
}

// exportRoot is the way from a saved file back to the export's top folder:
// "" for index.html, "../" for sg/index.html.
func exportRoot(name string) string {
	return strings.Repeat("../", strings.Count(name, "/"))
}

// exportRef turns a root-relative reference into one relative to a page
// root: files keep their path, pages point at their index.html.
func exportRef(ref, root string) string {
	p, rest := ref, ""
	if i := strings.IndexAny(ref, "?#"); i >= 0 {
		p, rest = ref[:i], ref[i:]
	}
	if isExportFile(p) {
		return root + strings.TrimPrefix(p, "/") + rest
	}
	p = strings.Trim(p, "/")
	if p != "" {
		p += "/"
	}
	return root + p + "index.html" + rest
}

func isExportFile(p string) bool {
	return strings.HasPrefix(p, "/_next/") || strings.HasPrefix(p, "/assets/") || strings.HasPrefix(p, "/uploads/") || nonPageExtRe.MatchString(p)
}

var (
	rootAttrRe     = regexp.MustCompile(`\b(href|src|poster|action|data-src)="(/[^/"][^"]*|/)"`)
	srcsetRe       = regexp.MustCompile(`\b(srcset|imagesrcset)="([^"]*)"`)
	srcsetURLRe    = regexp.MustCompile(`(^|,\s*)(/[^/\s,][^\s,]*)`)
	styleURLRe     = regexp.MustCompile(`url\((&quot;|['"]?)(/[^/)'"&][^)'"&]*)(&quot;|['"]?)\)`)
	linkTagRe      = regexp.MustCompile(`<link\b[^>]*>`)
	absoluteLinkRe = regexp.MustCompile(`\brel="[^"]*\b(?:canonical|alternate)\b[^"]*"`)
	linkHrefRe     = regexp.MustCompile(`\bhref="(/[^"]*)"`)
	fontPreloadRe  = regexp.MustCompile(`\bas="font"`)
	metaContentRe  = regexp.MustCompile(`(<meta\b[^>]*\bcontent=")(/[^/"][^"]*)"`)
	nextScriptRe   = regexp.MustCompile(`<script\b([^>]*?)\bsrc="(/_next/[^"]*)"([^>]*)></script>`)
	headOpenRe     = regexp.MustCompile(`<head\b[^>]*>`)
	flightPushRe   = regexp.MustCompile(`<script>self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)</script>`)
	chunkBaseRe    = regexp.MustCompile(`=\s*"/_next/"`)
	jsonAssetRe    = regexp.MustCompile(`(^|[^\\])"(/(?:_next|assets|uploads)/[^"\\]*)"`)
	jsonEscAssetRe = regexp.MustCompile(`\\"(/(?:_next|assets|uploads)/[^"\\]*)\\"`)
	jsonHrefRe     = regexp.MustCompile(`"(href|src)":"(/[^/"\\][^"\\]*|/)"`)
	jsonHTMLAttrRe = regexp.MustCompile(`\b(href|src)=\\"(/[^/"\\][^"\\]*|/)\\"`)
	textHTMLAttrRe = regexp.MustCompile(`\b(href|src|poster)=(["'])(/[^/"'][^"']*|/)(["'])`)
	cssRootURLRe   = regexp.MustCompile(`url\(\s*(['"]?)(/[^/)'"][^)'"]*)(['"]?)\s*\)`)
	fontExtRe      = regexp.MustCompile(`(?i)\.(woff2?|ttf|otf|eot)(?:[?#].*)?$`)
)

// relativeHTML makes a saved page work from any folder (see the top of this
// file). name is where the page is saved in the zip; publicURL is the site's
// public address, kept for canonical links and share-image tags, which need
// a full address. The page data is done before, by rewriteFlight.
func relativeHTML(text, name, publicURL string) string {
	root := exportRoot(name)

	text = linkTagRe.ReplaceAllStringFunc(text, func(tag string) string {
		if fontPreloadRe.MatchString(tag) {
			return "" // fonts are in the CSS now; a font preload fails from disk
		}
		if absoluteLinkRe.MatchString(tag) && publicURL != "" {
			return linkHrefRe.ReplaceAllString(tag, `href="`+publicURL+`${1}"`)
		}
		return tag
	})
	if publicURL != "" {
		text = metaContentRe.ReplaceAllString(text, `${1}`+publicURL+`${2}"`)
	}

	// Scripts get their full address when the page loads (Next.js's chunk
	// loader compares script addresses with full ones).
	found := false
	text = nextScriptRe.ReplaceAllStringFunc(text, func(tag string) string {
		m := nextScriptRe.FindStringSubmatch(tag)
		found = true
		return `<script` + m[1] + `data-export-src="` + exportRef(m[2], root) + `"` + m[3] + `></script>`
	})
	if found {
		const closeTag = "</script>"
		last := strings.LastIndex(text, "data-export-src=")
		if end := strings.Index(text[last:], closeTag); end >= 0 {
			at := last + end + len(closeTag)
			text = text[:at] + `<script>` + offlineLoader + `</script>` + text[at:]
		}
	}

	text = rootAttrRe.ReplaceAllStringFunc(text, func(m string) string {
		g := rootAttrRe.FindStringSubmatch(m)
		return g[1] + `="` + exportRef(g[2], root) + `"`
	})
	text = srcsetRe.ReplaceAllStringFunc(text, func(m string) string {
		g := srcsetRe.FindStringSubmatch(m)
		set := srcsetURLRe.ReplaceAllStringFunc(g[2], func(u string) string {
			p := srcsetURLRe.FindStringSubmatch(u)
			return p[1] + exportRef(p[2], root)
		})
		return g[1] + `="` + set + `"`
	})
	text = styleURLRe.ReplaceAllStringFunc(text, func(m string) string {
		g := styleURLRe.FindStringSubmatch(m)
		return "url(" + g[1] + exportRef(g[2], root) + g[3] + ")"
	})

	// The shim goes first in <head>, before anything Next.js runs.
	shim := `<script>` + strings.Replace(offlineShim, "__ROOT__", strconv.Quote(root), 1) + `</script>`
	if loc := headOpenRe.FindStringIndex(text); loc != nil {
		text = text[:loc[1]] + shim + text[loc[1]:]
	}
	return text
}

// rewriteFlight rewrites the page data Next.js embeds in the page
// (self.__next_f.push([1,"..."]) scripts, together one stream of rows): file
// and link paths become relative to the page. Text rows ("id:T<hex length>,")
// carry their length in bytes, so it's recounted after the rewrite. pre
// is applied to each row first (the site's own address made root-relative:
// done to the whole page, it would change text rows without their lengths).
// The whole stream goes back as one script, where the last one was.
func rewriteFlight(text, root string, pre func(string) string) string {
	pushes := flightPushRe.FindAllStringSubmatchIndex(text, -1)
	if len(pushes) == 0 {
		return text
	}
	var stream strings.Builder
	for _, loc := range pushes {
		var chunk string
		if err := json.Unmarshal([]byte(text[loc[2]:loc[3]]), &chunk); err != nil {
			return text // not the format we know: leave the page as it is
		}
		stream.WriteString(chunk)
	}
	in := stream.String()

	var out strings.Builder
	for i := 0; i < len(in); {
		colon := strings.IndexByte(in[i:], ':')
		if colon < 0 {
			out.WriteString(in[i:])
			break
		}
		colon += i
		id := in[i:colon]
		if colon+1 < len(in) && in[colon+1] == 'T' {
			comma := strings.IndexByte(in[colon:], ',')
			if comma < 0 {
				return text
			}
			comma += colon
			size, err := strconv.ParseInt(in[colon+2:comma], 16, 64)
			if err != nil || comma+1+int(size) > len(in) {
				return text
			}
			body := rewriteFlightText(pre(in[comma+1:comma+1+int(size)]), root)
			fmt.Fprintf(&out, "%s:T%x,%s", id, len(body), body)
			i = comma + 1 + int(size)
			continue
		}
		end := strings.IndexByte(in[colon:], '\n')
		if end < 0 {
			end = len(in)
		} else {
			end += colon
		}
		row := in[colon+1 : end]
		// Font preloads: the fonts are in the CSS (and a preload fails from disk).
		if !(strings.HasPrefix(row, "HL[") && strings.Contains(row, `,"font"`)) {
			out.WriteString(id + ":" + rewriteFlightRow(pre(row), root) + "\n")
		}
		i = end + 1
	}

	encoded, err := json.Marshal(out.String())
	if err != nil {
		return text
	}
	script := `<script>self.__next_f.push([1,` + string(encoded) + `])</script>`
	var b strings.Builder
	prev := 0
	for n, loc := range pushes {
		b.WriteString(text[prev:loc[0]])
		if n == len(pushes)-1 {
			b.WriteString(script)
		}
		prev = loc[1]
	}
	b.WriteString(text[prev:])
	return b.String()
}

// rewriteFlightRow: a JSON row. Asset paths anywhere (also inside JSON in a
// string, like JSON-LD), page links in href/src props, and links in HTML
// strings (rich text).
func rewriteFlightRow(row, root string) string {
	row = jsonEscAssetRe.ReplaceAllStringFunc(row, func(m string) string {
		return `\"` + exportRef(jsonEscAssetRe.FindStringSubmatch(m)[1], root) + `\"`
	})
	row = jsonAssetRe.ReplaceAllStringFunc(row, func(m string) string {
		g := jsonAssetRe.FindStringSubmatch(m)
		return g[1] + `"` + exportRef(g[2], root) + `"`
	})
	row = jsonHrefRe.ReplaceAllStringFunc(row, func(m string) string {
		g := jsonHrefRe.FindStringSubmatch(m)
		return `"` + g[1] + `":"` + exportRef(g[2], root) + `"`
	})
	return jsonHTMLAttrRe.ReplaceAllStringFunc(row, func(m string) string {
		g := jsonHTMLAttrRe.FindStringSubmatch(m)
		return g[1] + `=\"` + exportRef(g[2], root) + `\"`
	})
}

// rewriteFlightText: a text row, which is HTML (rich text).
func rewriteFlightText(body, root string) string {
	return textHTMLAttrRe.ReplaceAllStringFunc(body, func(m string) string {
		g := textHTMLAttrRe.FindStringSubmatch(m)
		return g[1] + "=" + g[2] + exportRef(g[3], root) + g[4]
	})
}

// relativeCSS points root-relative url()s in a stylesheet at the files
// relative to the stylesheet itself.
func relativeCSS(text, name string) string {
	root := exportRoot(name)
	return cssRootURLRe.ReplaceAllStringFunc(text, func(m string) string {
		g := cssRootURLRe.FindStringSubmatch(m)
		return "url(" + g[1] + root + strings.TrimPrefix(g[2], "/") + g[3] + ")"
	})
}

// inlineFonts puts the fonts a stylesheet uses into it as data: URLs:
// browsers refuse font files loaded from a page opened from disk.
func (c *exportCrawl) inlineFonts(ctx context.Context, text, from string) string {
	return cssURLRe.ReplaceAllStringFunc(text, func(m string) string {
		ref := cssURLRe.FindStringSubmatch(m)[1]
		if !fontExtRe.MatchString(ref) || strings.HasPrefix(ref, "data:") {
			return m
		}
		if !strings.HasPrefix(ref, "/") && !strings.Contains(ref, "://") {
			ref = path.Join(path.Dir(from), ref)
		}
		source, _, ok := c.resolve(ref)
		if !ok {
			return m
		}
		body, _, err := c.get(ctx, source)
		if err != nil || len(body) > 2<<20 {
			return m
		}
		ext := strings.ToLower(fontExtRe.FindStringSubmatch(ref)[1])
		mediaType := mime.TypeByExtension("." + ext)
		if mediaType == "" {
			mediaType = "font/" + ext
		}
		return "url(data:" + mediaType + ";base64," + base64.StdEncoding.EncodeToString(body) + ")"
	})
}

// patchChunkRuntime: Next.js's chunk loader has "/_next/" as its base path,
// which from disk or a subfolder is the wrong place. It's taken from where
// the loader script itself was loaded instead (falling back to "/_next/").
func patchChunkRuntime(text string) string {
	if !strings.Contains(text, "TURBOPACK") && !strings.Contains(text, "__webpack_require__") {
		return text
	}
	return chunkBaseRe.ReplaceAllLiteralString(text, `=((document.currentScript&&document.currentScript.src)||"").split("/_next/")[0]+"/_next/"`)
}

// offlineLoader adds the page's Next.js scripts with their full addresses.
const offlineLoader = `document.querySelectorAll("script[data-export-src]").forEach(function(o){var s=document.createElement("script");for(var i=0;i<o.attributes.length;i++){var a=o.attributes[i];if(a.name!=="data-export-src")s.setAttribute(a.name,a.value)}s.src=new URL(o.getAttribute("data-export-src"),location.href).href;s.async=true;o.parentNode.replaceChild(s,o)})`

// offlineShim (first in <head>; __ROOT__ is the way to the top folder):
//   - clicks on the site's own links load the page normally, not through
//     Next.js's router (which would ask a server for page data);
//   - Next.js's page-data requests (?_rsc=, prefetching links) get an empty
//     "not found" here instead of failing in the console;
//   - links and images added in the browser with a root path ("/sg") are
//     pointed at the saved files.
const offlineShim = `(function(){var R=new URL(__ROOT__||"./",location.href).href;
function map(v){var m=v.match(/^([^?#]*)(.*)$/),p=m[1];if(/^\/(_next|assets|uploads)\//.test(p)||/\.[A-Za-z0-9]{2,5}$/.test(p))return R+p.slice(1)+m[2];p=p.replace(/^\/+|\/+$/g,"");return R+(p?p+"/":"")+"index.html"+m[2]}
function fix(el){if(!el.getAttribute)return;["href","src","poster"].forEach(function(a){var v=el.getAttribute(a);if(v&&v.charAt(0)==="/"&&v.charAt(1)!=="/")el.setAttribute(a,map(v))})}
new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==="attributes")return fix(m.target);m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;fix(n);n.querySelectorAll("[href^='/'],[src^='/'],[poster^='/']").forEach(fix)})})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["href","src","poster"]});
var f=window.fetch;window.fetch=function(i,o){var u=typeof i==="string"?i:(i&&i.url)||String(i);if(/[?&]_rsc=/.test(u)||(o&&o.headers&&(o.headers.RSC||o.headers.rsc)))return Promise.resolve(new Response("",{status:404,headers:{"content-type":"text/plain"}}));return f.apply(this,arguments)};
addEventListener("click",function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a||(a.target&&a.target!=="_self")||a.hasAttribute("download"))return;var h=a.getAttribute("href");if(h.charAt(0)==="/"&&h.charAt(1)!=="/")h=map(h);var u=new URL(h,location.href);if(u.protocol!==location.protocol||u.host!==location.host)return;if(u.pathname===location.pathname&&u.search===location.search&&u.hash)return;e.preventDefault();e.stopPropagation();location.href=u.href},true);
})();`
