"use client";

import { useEffect, useState } from "react";
import { Segmented, Modal, Form, Input, Select, InputNumber, App as AntApp } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { MenuItemDTO, MenuLocation, MenuItemSourceType } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconTrash, IconPlus } from "@/components/Icons";

interface TreeNode extends MenuItemDTO {
  children: TreeNode[];
}

function buildTree(items: MenuItemDTO[]): TreeNode[] {
  const byId = new Map<number, TreeNode>(items.map((item) => [item.id, { ...item, children: [] }]));
  const roots: TreeNode[] = [];
  for (const item of items) {
    const node = byId.get(item.id);
    if (!node) continue;
    if (item.parentId === null) {
      roots.push(node);
    } else {
      byId.get(item.parentId)?.children.push(node);
    }
  }
  return roots;
}

const SOURCE_TYPE_LABELS: Record<MenuItemSourceType, string> = {
  static: "Static",
  dynamic_regions: "Auto: Regions",
  dynamic_casinos: "Auto: Casino Reviews",
};

export default function NavigationPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [location, setLocation] = useState<MenuLocation>("header");
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTarget, setFormTarget] = useState<MenuItemDTO | "new" | null>(null);
  const [formParentId, setFormParentId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<{ menuItems: MenuItemDTO[] | null }>(`/api/admin/menu-items?location=${location}`);
      setItems(data.menuItems ?? []);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load menu items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (!user) return null;

  if (user.role !== "super_admin" && user.role !== "admin") {
    return (
      <section id="navigation-page" className="navigation-page">
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  async function handleDelete(item: MenuItemDTO) {
    const ok = await confirm({
      title: "Delete Menu Item",
      message: `Delete "${item.label}"? Any nested columns/links under it will be deleted too. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/menu-items/${item.id}`);
      message.success("Deleted.");
      load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete menu item.");
    }
  }

  const tree = buildTree(items);

  return (
    <section id="navigation-page" className="navigation-page flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Navigation</h1>
        <IconButton
          id="navigation-add-root-button"
          title={location === "header" ? "Add Tab" : "Add Column"}
          onClick={() => {
            setFormParentId(null);
            setFormTarget("new");
          }}
          icon={<IconPlus />}
        />
      </div>

      <Segmented
        id="navigation-location-switch"
        value={location}
        onChange={(v) => setLocation(v as MenuLocation)}
        options={[
          { label: "Header Menu", value: "header" },
          { label: "Footer Menu", value: "footer" },
        ]}
      />

      <p className="text-sm text-text-muted dark:text-text-muted-dark">
        {location === "header"
          ? "Top-level items are the header's tabs. Add columns under a tab, then links under a column."
          : "Top-level items are the footer's columns. Add links under each column."}
      </p>

      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : tree.length === 0 ? (
        <p className="text-text-muted dark:text-text-muted-dark">No items yet.</p>
      ) : (
        <div id="navigation-tree" className="navigation-tree flex flex-col gap-1 rounded-lg border border-border p-3 dark:border-border-dark">
          {tree.map((node) => (
            <MenuNodeRow
              key={node.id}
              node={node}
              depth={0}
              onAddChild={(parentId) => {
                setFormParentId(parentId);
                setFormTarget("new");
              }}
              onEdit={(item) => {
                setFormParentId(item.parentId);
                setFormTarget(item);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {formTarget && (
        <MenuItemFormModal
          target={formTarget === "new" ? null : formTarget}
          location={location}
          parentId={formParentId}
          onClose={() => setFormTarget(null)}
          onSaved={() => {
            setFormTarget(null);
            load();
          }}
        />
      )}
    </section>
  );
}

function MenuNodeRow({
  node,
  depth,
  onAddChild,
  onEdit,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  onAddChild: (parentId: number) => void;
  onEdit: (item: MenuItemDTO) => void;
  onDelete: (item: MenuItemDTO) => void;
}) {
  return (
    <div className="menu-node-row flex flex-col">
      <div
        id={`menu-item-${node.id}`}
        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-surface-muted dark:hover:bg-surface-muted-dark"
        style={{ marginLeft: depth * 24 }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-text dark:text-text-dark">{node.label}</span>
          {node.href && (
            <span className="truncate text-xs text-text-muted dark:text-text-muted-dark">{node.href}</span>
          )}
          {node.sourceType !== "static" && (
            <span className="shrink-0 rounded-full bg-secondary-100 px-2 py-0.5 text-[11px] font-medium text-secondary-800">
              {SOURCE_TYPE_LABELS[node.sourceType]}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <IconButton
            id={`menu-item-${node.id}-add-child`}
            title="Add Child Item"
            onClick={() => onAddChild(node.id)}
            icon={<IconPlus width={14} height={14} />}
            variant="muted"
          />
          <IconButton
            id={`menu-item-${node.id}-edit`}
            title="Edit Menu Item"
            onClick={() => onEdit(node)}
            icon={<IconEdit width={14} height={14} />}
            variant="muted"
          />
          <IconButton
            id={`menu-item-${node.id}-delete`}
            title="Delete Menu Item"
            onClick={() => onDelete(node)}
            icon={<IconTrash width={14} height={14} />}
            variant="danger"
          />
        </div>
      </div>
      {node.children.map((child) => (
        <MenuNodeRow key={child.id} node={child} depth={depth + 1} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function MenuItemFormModal({
  target,
  location,
  parentId,
  onClose,
  onSaved,
}: {
  target: MenuItemDTO | null;
  location: MenuLocation;
  parentId: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish(values: { label: string; href?: string; sourceType: MenuItemSourceType; sortOrder: number }) {
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Menu Item",
      message: target ? `Update "${values.label}"?` : `Create menu item "${values.label}"?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = {
      location,
      parentId,
      label: values.label,
      href: values.href || null,
      sourceType: values.sourceType,
      sortOrder: values.sortOrder,
    };
    try {
      if (target) {
        await api.put(`/api/admin/menu-items/${target.id}`, body);
        message.success("Saved.");
      } else {
        await api.post("/api/admin/menu-items", body);
        message.success("Menu item created.");
      }
      onSaved();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save menu item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={target ? "Edit Menu Item" : "Add Menu Item"}
      open
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Save"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          label: target?.label ?? "",
          href: target?.href ?? "",
          sourceType: target?.sourceType ?? "static",
          sortOrder: target?.sortOrder ?? 0,
        }}
      >
        <Form.Item name="label" label="Label" rules={[{ required: true }]}>
          <Input placeholder="e.g. Casino Reviews" />
        </Form.Item>
        <Form.Item name="href" label="Link URL" extra="Leave blank if this item just groups other items (a tab or column heading).">
          <Input placeholder="/casinos" />
        </Form.Item>
        <Form.Item
          name="sourceType"
          label="Content Source"
          extra="Auto options replace this item's own children with a live list fetched from the site (Regions or Casino Reviews)."
        >
          <Select
            options={[
              { value: "static", label: "Static (manually managed below)" },
              { value: "dynamic_regions", label: "Auto: Regions" },
              { value: "dynamic_casinos", label: "Auto: Casino Reviews" },
            ]}
          />
        </Form.Item>
        <Form.Item name="sortOrder" label="Sort Order">
          <InputNumber className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
