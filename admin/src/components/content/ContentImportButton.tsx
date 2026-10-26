"use client";

import { useEffect, useState } from "react";
import { Modal, Table, Tabs, Upload, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import IconButton from "@/components/IconButton";
import { IconUpload } from "@/components/Icons";
import type { ImportColumnDTO, ImportReportDTO, ImportTypeDTO } from "@/lib/types";
import { columnFormat, downloadImportTemplate } from "@/lib/contentImport";

let typesCache: Promise<ImportTypeDTO[]> | null = null;

function loadImportTypes(): Promise<ImportTypeDTO[]> {
  typesCache ??= api
    .get<{ types: ImportTypeDTO[] }>("/api/admin/content-imports")
    .then((data) => data.types ?? [])
    .catch((err) => {
      typesCache = null;
      throw err;
    });
  return typesCache;
}

// "Import" on a content list: download the CSV/JSON template, read the exact
// format, upload a filled-in file, check it (nothing is saved while any row
// has a problem) and then import it. The format comes from the API
// (ContentImportService), so the guide and the checks always match.
export default function ContentImportButton({ type, onImported }: { type: string; onImported: () => void }) {
  const { message } = AntApp.useApp();
  const [open, setOpen] = useState(false);
  const [spec, setSpec] = useState<ImportTypeDTO | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReportDTO | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || spec) return;
    loadImportTypes()
      .then((types) => setSpec(types.find((t) => t.key === type) ?? null))
      .catch((err) => message.error(err instanceof ApiError ? err.message : "Could not load the import format."));
  }, [open, spec, type, message]);

  function close() {
    setOpen(false);
    setFile(null);
    setReport(null);
  }

  async function send(dryRun: boolean) {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("dryRun", dryRun ? "1" : "0");
    setBusy(true);
    try {
      const data = await api.upload<{ report: ImportReportDTO }>(`/api/admin/content-imports/${type}`, form);
      setReport(data.report);
      if (!dryRun && data.report.applied) {
        const failed = data.report.errors.length;
        message[failed ? "warning" : "success"](
          `Imported: ${data.report.created} new, ${data.report.updated} updated${failed ? `, ${failed} failed` : ""}.`,
        );
        onImported();
        if (!failed) close();
      }
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not check the file.");
    } finally {
      setBusy(false);
    }
  }

  async function copyErrors() {
    if (!report || !spec) return;
    const lines = report.errors.map((e) => `${e.row ? `${report.format === "json" ? "Item" : "Row"} ${e.row}` : "File"}${e.column ? ` · ${e.column}` : ""}: ${e.message}`);
    await navigator.clipboard.writeText(`Import problems (${spec.label}, ${file?.name ?? ""}):\n${lines.join("\n")}`);
    message.success("Problems copied.");
  }

  const checked = report !== null && !report.applied;
  const ready = checked && report.dryRun && report.errors.length === 0;

  return (
    <>
      <IconButton id={`${type}-import-button`} title="Import (CSV or JSON)" onClick={() => setOpen(true)} icon={<IconUpload />} variant="muted" />
      <Modal
        open={open}
        title={`Import ${spec?.label ?? ""}`}
        width={980}
        onCancel={close}
        destroyOnHidden
        okText={ready ? `Import ${report.rows} row${report.rows === 1 ? "" : "s"}` : "Check File"}
        okButtonProps={{ disabled: !file, loading: busy }}
        onOk={() => send(!ready)}
      >
        {!spec ? (
          <p className="py-6 text-sm text-text-muted">Loading the import format…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 rounded-md bg-surface-muted px-4 py-3 text-sm dark:bg-surface-muted-dark">
              <span>
                1. Download a template, fill it in, keep every column exactly as it is. Existing items are matched by{" "}
                <strong>{spec.matchBy}</strong> and updated; everything else is created.
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  id={`${type}-import-template-csv`}
                  onClick={() => downloadImportTemplate(spec, "csv")}
                  className="cursor-pointer rounded-md border border-primary-300 bg-surface px-3 py-1.5 font-medium text-primary-700 hover:bg-primary-50"
                >
                  CSV template
                </button>
                <button
                  type="button"
                  id={`${type}-import-template-json`}
                  onClick={() => downloadImportTemplate(spec, "json")}
                  className="cursor-pointer rounded-md border border-primary-300 bg-surface px-3 py-1.5 font-medium text-primary-700 hover:bg-primary-50"
                >
                  JSON template
                </button>
              </div>
            </div>

            <Tabs
              size="small"
              items={[
                {
                  key: "upload",
                  label: "Upload",
                  children: (
                    <div className="flex flex-col gap-4">
                      <Upload.Dragger
                        accept=".csv,.json"
                        maxCount={1}
                        beforeUpload={(f) => {
                          setFile(f);
                          setReport(null);
                          return false;
                        }}
                        onRemove={() => {
                          setFile(null);
                          setReport(null);
                        }}
                        fileList={file ? [{ uid: "import-file", name: file.name, status: "done" }] : []}
                      >
                        <p className="py-2 text-sm">2. Drop the filled-in .csv or .json file here, or click to choose it.</p>
                        <p className="text-xs text-text-muted">3. Check File first — nothing is saved until every row is correct.</p>
                      </Upload.Dragger>
                      {report && <ImportReportView report={report} onCopy={copyErrors} />}
                    </div>
                  ),
                },
                {
                  key: "format",
                  label: `Format (${spec.columns.length} columns)`,
                  children: <FormatTable columns={spec.columns} />,
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </>
  );
}

function ImportReportView({ report, onCopy }: { report: ImportReportDTO; onCopy: () => void }) {
  const unit = report.format === "json" ? "Item" : "Row";
  if (report.errors.length === 0) {
    return (
      <p className="rounded-md bg-success/10 px-4 py-3 text-sm text-success">
        {report.applied
          ? `Imported ${report.rows} rows: ${report.created} new, ${report.updated} updated.`
          : `${report.rows === 1 ? "The row is" : `All ${report.rows} rows are`} correct: ${report.created} will be created and ${report.updated} updated. Click Import to save.`}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-danger">
          {report.applied
            ? `${report.errors.length} row${report.errors.length === 1 ? "" : "s"} could not be saved (the others were imported):`
            : `${report.errors.length} problem${report.errors.length === 1 ? "" : "s"} found — nothing was saved. Fix the file and check it again.`}
        </p>
        <button type="button" onClick={onCopy} className="cursor-pointer text-sm text-primary-600 hover:underline">
          Copy problems
        </button>
      </div>
      <Table
        size="small"
        rowKey="key"
        dataSource={report.errors.map((error, index) => ({ ...error, key: index }))}
        pagination={report.errors.length > 10 ? { pageSize: 10 } : false}
        columns={[
          { title: unit, dataIndex: "row", width: 70, render: (row: number) => (row ? row : "File") },
          { title: "Column", dataIndex: "column", width: 170, render: (c?: string) => c ?? "—" },
          { title: "Problem", dataIndex: "message" },
        ]}
      />
    </div>
  );
}

function FormatTable({ columns }: { columns: ImportColumnDTO[] }) {
  return (
    <Table
      size="small"
      rowKey="key"
      dataSource={columns}
      pagination={false}
      scroll={{ y: 360 }}
      columns={[
        {
          title: "Column",
          dataIndex: "key",
          width: 170,
          render: (key: string, c) => (
            <span className="font-mono text-xs">
              {key}
              {c.required && <span className="ml-1 text-danger">*</span>}
            </span>
          ),
        },
        { title: "Format", key: "format", width: 260, render: (_, c) => <span className="text-xs">{columnFormat(c)}</span> },
        { title: "Meaning", dataIndex: "help", render: (h: string) => <span className="text-xs">{h}</span> },
        { title: "Example", dataIndex: "example", width: 170, render: (e: string) => <span className="font-mono text-xs break-all">{e || "—"}</span> },
      ]}
      footer={() => <span className="text-xs text-text-muted">* required. Empty cells (or null in JSON) clear optional values.</span>}
    />
  );
}
