"use client";

import { useState } from "react";
import { Modal, Select, DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useConfirm } from "@/components/ConfirmDialog";
import IconButton from "@/components/IconButton";
import { IconCalendar } from "@/components/Icons";
import { titleCase } from "@/lib/format";
import type { ContentStatus } from "@/lib/types";

interface PublishControlProps {
  id: string;
  status: ContentStatus;
  publishAt: string | null;
  onSave: (status: ContentStatus, publishAt: string | null) => Promise<void>;
}

const STATUS_OPTIONS: ContentStatus[] = ["draft", "scheduled", "published"];

// Reused by every content type (Casinos, Bonuses, Payment Methods, RTP,
// Guides, Blacklist, News, Pages). "Scheduled" becomes effectively published
// the moment its time passes; there's no cron job flipping the stored
// status, so the dashboard just shows what was set. The trigger is always
// the same calendar icon (a small dot badges it when a schedule is already
// set) - the actual date/time only ever shows inside the modal, opened on
// click, to keep the Actions column compact.
export default function PublishControl({ id, status, publishAt, onSave }: PublishControlProps) {
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<ContentStatus>(status);
  const [nextPublishAt, setNextPublishAt] = useState<Dayjs | null>(publishAt ? dayjs(publishAt) : null);
  const [saving, setSaving] = useState(false);

  function openModal() {
    setNextStatus(status);
    setNextPublishAt(publishAt ? dayjs(publishAt) : null);
    setOpen(true);
  }

  async function handleSave() {
    if (nextStatus === "scheduled" && !nextPublishAt) return;
    const ok = await confirm({
      title: "Change Publish Status",
      message: `Set status to "${titleCase(nextStatus)}"${
        nextStatus === "scheduled" && nextPublishAt ? ` for ${nextPublishAt.format("MMM D, YYYY h:mm A")}` : ""
      }?`,
      confirmLabel: "Save",
    });
    if (!ok) return;

    setSaving(true);
    try {
      await onSave(nextStatus, nextStatus === "scheduled" ? nextPublishAt!.toISOString() : null);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelSchedule() {
    const ok = await confirm({
      title: "Cancel Schedule",
      message: "This reverts the item to Draft. It won't publish automatically anymore.",
      confirmLabel: "Cancel Schedule",
      danger: true,
    });
    if (!ok) return;
    await onSave("draft", null);
  }

  const isScheduled = status === "scheduled" && !!publishAt;

  return (
    <>
      <div className="publish-control relative inline-flex">
        <IconButton
          id={id}
          title={isScheduled ? `Scheduled for ${dayjs(publishAt).format("MMM D, YYYY h:mm A")}` : "Publish Settings"}
          onClick={openModal}
          icon={<IconCalendar />}
          variant="muted"
        />
        {isScheduled && (
          <span
            aria-hidden="true"
            className="publish-control__badge pointer-events-none absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-secondary-500"
          />
        )}
      </div>
      <Modal
        title="Publish Settings"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Save"
        okButtonProps={{ disabled: nextStatus === "scheduled" && !nextPublishAt }}
        footer={(originalFooter) => (
          <div className="flex items-center justify-between">
            {isScheduled ? (
              <button
                type="button"
                onClick={handleCancelSchedule}
                className="cursor-pointer text-sm font-medium text-danger hover:underline"
              >
                Cancel Schedule
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">{originalFooter}</div>
          </div>
        )}
      >
        <div className="flex flex-col gap-4 py-2">
          {isScheduled && (
            <p className="text-sm text-text-muted dark:text-text-muted-dark">
              Currently scheduled for <strong className="text-text dark:text-text-dark">{dayjs(publishAt).format("MMM D, YYYY h:mm A")}</strong>.
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text dark:text-text-dark">Status</label>
            <Select
              value={nextStatus}
              onChange={setNextStatus}
              options={STATUS_OPTIONS.map((s) => ({ value: s, label: titleCase(s) }))}
            />
          </div>
          {nextStatus === "scheduled" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text dark:text-text-dark">Publish At</label>
              <DatePicker showTime value={nextPublishAt} onChange={setNextPublishAt} className="w-full" />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
