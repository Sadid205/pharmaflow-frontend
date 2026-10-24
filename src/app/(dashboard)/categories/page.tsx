'use client';

import React, { useState } from 'react';
import { Tags, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  Category,
} from '@/redux/api/categoryApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';

export default function CategoriesPage() {
  const { data: response, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryItem, setDeleteCategoryItem] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const categories = response?.data || [];

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        const res = await updateCategory({
          id: editingCategory.id,
          name: name.trim(),
          description: description.trim() || undefined,
        }).unwrap();
        if (res.success) {
          toast.success('Category updated successfully');
          setIsModalOpen(false);
        }
      } else {
        const res = await createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
        }).unwrap();
        if (res.success) {
          toast.success('Category created successfully');
          setIsModalOpen(false);
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteCategoryItem) return;
    try {
      const res = await deleteCategory(deleteCategoryItem.id).unwrap();
      if (res.success) {
        toast.success(`Deleted category "${deleteCategoryItem.name}"`);
        setDeleteCategoryItem(null);
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Tags className="w-6 h-6 text-teal-600" />
            <span>Medicine Categories</span>
          </h1>
          <p className="text-sm text-slate-500">
            Organize medicines into functional dosage and prescription classifications.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="md" className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tags className="w-8 h-8" />}
          title="No Categories Yet"
          description="Create your first medicine classification to help organize inventory."
          actionLabel="Create Category"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Associated Medicines</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {cat.description || 'No description provided'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary">
                        {cat._count?.medicines ?? 0} medicines
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCategoryItem(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g. Syrup, Tablet, Inhaler"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of this classification..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteCategoryItem)}
        onClose={() => setDeleteCategoryItem(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteCategoryItem?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
