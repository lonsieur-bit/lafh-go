import { useState } from "react";
import { ArrowRight, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppState } from "@/context/AppStateContext";
import type { SavedAddress } from "@/lib/types";

const AddressesPage = () => {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAppState();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setLabel("");
    setDetail("");
    setIsDefault(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!label.trim() || !detail.trim()) return;
    const payload: Omit<SavedAddress, "id"> = {
      label: label.trim(),
      detail: detail.trim(),
      isDefault,
    };
    if (editingId) {
      updateAddress(editingId, payload);
    } else {
      addAddress(payload);
    }
    resetForm();
    setOpen(false);
  };

  const startEdit = (address: SavedAddress) => {
    setEditingId(address.id);
    setLabel(address.label);
    setDetail(address.detail);
    setIsDefault(address.isDefault);
    setOpen(true);
  };

  return (
    <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
      <div className="pt-12 px-5 pb-4 border-b border-border bg-card flex-shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link to="/app/profile" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground font-arabic">العناوين المحفوظة</h1>
            <p className="text-xs text-muted-foreground font-arabic mt-1">أضف عناوين للوصول السريع</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-xl shadow-glow shrink-0" aria-label="إضافة عنوان">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-arabic text-right">
                {editingId ? "تعديل العنوان" : "عنوان جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="addr-label" className="font-arabic">
                  التسمية
                </Label>
                <Input
                  id="addr-label"
                  placeholder="مثال: المنزل"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="rounded-xl font-arabic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-detail" className="font-arabic">
                  التفاصيل
                </Label>
                <Input
                  id="addr-detail"
                  placeholder="الحي، الشارع، المعلم"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="rounded-xl font-arabic"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="addr-default"
                  checked={isDefault}
                  onCheckedChange={(c) => setIsDefault(c === true)}
                />
                <Label htmlFor="addr-default" className="text-sm font-arabic cursor-pointer">
                  تعيين كافتراضي
                </Label>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-xl font-arabic" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="button" className="rounded-xl font-arabic" onClick={handleSubmit}>
                {editingId ? "تحديث" : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="bg-card rounded-xl p-4 shadow-elevated border border-border flex gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground font-arabic">{a.label}</p>
                {a.isDefault && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary font-arabic flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    افتراضي
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-arabic mt-1 leading-relaxed">{a.detail}</p>
              <div className="flex items-center gap-2 mt-2">
                {!a.isDefault && (
                  <button
                    type="button"
                    className="text-[11px] text-primary font-arabic"
                    onClick={() => setDefaultAddress(a.id)}
                  >
                    تعيين كافتراضي
                  </button>
                )}
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground font-arabic inline-flex items-center gap-1"
                  onClick={() => startEdit(a)}
                >
                  <Pencil className="w-3 h-3" />
                  تعديل
                </button>
                <button
                  type="button"
                  className="text-[11px] text-destructive font-arabic inline-flex items-center gap-1"
                  onClick={() => deleteAddress(a.id)}
                >
                  <Trash2 className="w-3 h-3" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesPage;
