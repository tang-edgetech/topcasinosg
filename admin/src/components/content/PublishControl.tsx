"use client";

import { useState } from "react";
import { Modal, Select, DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useConfirm } from "@/components/ConfirmDialog";
import IconButton from "@/components/IconButton";
import { IconCalendar, IconEdit, IconClose } from "@/components/Icons";
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
// Guides, Blacklist, News). "Scheduled" becomes effectively published the
// moment its time passes; there's no cron job flipping the stored status,
// so the dashboard just shows what was set. When already scheduled, the
// trigger becomes an inline detail (date + edit + cancel) instead of a bare
// calendar icon, so the schedule is visible without opening the modal.
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

  return (
    <>
      {status === "scheduled" && publishAt ? (
        <div id={`${id}-schedule-detail`} className="publish-control__schedule flex items-center gap-2">
          <span className="whitespace-nowrap text-xs text-text dark:text-text-dark">
            {dayjs(publishAt).format("MMM D, YYYY h:mm A")}
          </span>
          <IconButton id={`${id}-edit`} title="Edit Schedule" onClick={openModal} icon={<IconEdit width={14} height={14} />} variant="muted" />
          <IconButton
            id={`${id}-cancel`}
            title="Cancel Schedule"
            onClick={handleCancelSchedule}
            icon={<IconClose width={14} height={14} />}
            variant="danger"
          />
        </div>
      ) : (
        <IconButton id={id} title="Publish Settings" onClick={openModal} icon={<IconCalendar />} variant="muted" />
      )}
      <Modal
        title="Publish Settings"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Save"
        okButtonProps={{ disabled: nextStatus === "scheduled" && !nextPublishAt }}
      >
        <div className="flex flex-col gap-4 py-2">
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
