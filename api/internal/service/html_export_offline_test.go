package service

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"
)

// cfEncode is Cloudflare's email encoding (key byte, then each byte XOR key).
func cfEncode(email string, key byte) string {
	out := fmt.Sprintf("%02x", key)
	for i := 0; i < len(email); i++ {
		out += fmt.Sprintf("%02x", email[i]^key)
	}
	return out
}

func TestCleanCloudflare(t *testing.T) {
	enc := cfEncode("hello@example.com", 0x62)
	in := `<p><a href="/cdn-cgi/l/email-protection#` + enc + `" class="x">Email us</a></p>` +
		`<span class="__cf_email__" data-cfemail="` + enc + `">[email&#160;protected]</span>` +
		`<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>` +
		`<script src="/_next/static/chunks/a.js"></script>` +
		`<script defer src="https://static.cloudflareinsights.com/beacon.min.js/v1" data-cf-beacon='{"token":"x"}'></script>`
	got := cleanCloudflare(in)
	for _, gone := range []string{"cdn-cgi", "cloudflareinsights", "data-cfemail"} {
		if strings.Contains(got, gone) {
			t.Errorf("%q left in %s", gone, got)
		}
	}
	for _, kept := range []string{`<a href="mailto:hello@example.com" class="x">Email us</a>`, "</p>hello@example.com<script", `src="/_next/static/chunks/a.js"`} {
		if !strings.Contains(got, kept) {
			t.Errorf("want %q in %s", kept, got)
		}
	}
}

func TestExportRef(t *testing.T) {
	cases := map[[2]string]string{
		{"/", ""}:                        "index.html",
		{"/sg", "../"}:                   "../sg/index.html",
		{"/sg/bonuses/?a=1#x", "../../"}: "../../sg/bonuses/index.html?a=1#x",
		{"/_next/static/c.js", "../"}:    "../_next/static/c.js",
		{"/uploads/a b.png", ""}:         "uploads/a b.png",
		{"/robots.txt", "../"}:           "../robots.txt",
	}
	for in, want := range cases {
		if got := exportRef(in[0], in[1]); got != want {
			t.Errorf("exportRef(%q, %q) = %q, want %q", in[0], in[1], got, want)
		}
	}
}

// Text rows keep a correct byte length after the site address is shortened
// and links are made relative, and the rows after them still parse.
func TestRewriteFlightKeepsTextRowLengths(t *testing.T) {
	text := `<p>é <a href="https://site.test/sg">Singapore</a></p>`
	stream := fmt.Sprintf("1:T%x,%s2:[\"$\",\"a\",null,{\"href\":\"/sg/bonuses\",\"src\":\"/uploads/x.png\"}]\n:HL[\"/_next/static/media/f.woff2\",\"font\"]\n", len(text), text)
	first, _ := json.Marshal(stream[:20])
	second, _ := json.Marshal(stream[20:])
	page := `<body><script>self.__next_f.push([1,` + string(first) + `])</script><div></div><script>self.__next_f.push([1,` + string(second) + `])</script></body>`

	out := rewriteFlight(page, "../", func(s string) string { return strings.ReplaceAll(s, "https://site.test/", "/") })
	if strings.Count(out, "self.__next_f.push") != 1 || !strings.Contains(out, "<div></div><script>self.__next_f") {
		t.Fatalf("want one script where the last was: %s", out)
	}
	raw := out[strings.Index(out, "[1,")+3 : strings.LastIndex(out, "])")]
	var got string
	if err := json.Unmarshal([]byte(raw), &got); err != nil {
		t.Fatal(err)
	}
	wantText := `<p>é <a href="../sg/index.html">Singapore</a></p>`
	want := fmt.Sprintf("1:T%x,%s2:[\"$\",\"a\",null,{\"href\":\"../sg/bonuses/index.html\",\"src\":\"../uploads/x.png\"}]\n", len(wantText), wantText)
	if got != want {
		t.Errorf("stream\n got %q\nwant %q", got, want)
	}
}

func TestPatchChunkRuntime(t *testing.T) {
	in := `(()=>{if(!Array.isArray(globalThis.TURBOPACK))return;let t="/_next/",r=1})()`
	got := patchChunkRuntime(in)
	if strings.Contains(got, `t="/_next/"`) || !strings.Contains(got, `document.currentScript`) {
		t.Errorf("not patched: %s", got)
	}
	if other := `let t="/_next/"`; patchChunkRuntime(other) != other {
		t.Error("only the chunk loader is patched")
	}
}
