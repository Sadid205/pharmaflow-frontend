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
import { Pagination } from '@/components/ui/Pagination';
import { useLanguage } from '@/context/LanguageContext';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { data: response, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryItem, setDeleteCategoryItem] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const categories = response?.data || [];
  const paginatedCategories = categories.slice((page - 1) * limit, page * limit);
  const totalPages = Math.max(1, Math.ceil(categories.length / limit));

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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Tags className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>{t('categories.title')}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('categories.subtitle')}
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="md" className="gap-2">
          <Plus className="w-4 h-4" />
          <span>{t('categories.addCategory')}</span>
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tags className="w-8 h-8" />}
          title={t('categories.noCategories')}
          description={t('categories.noCategories')}
          actionLabel={t('categories.addCategory')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">{t('categories.categoryName')}</th>
                  <th className="py-3 px-4">{t('categories.description')}</th>
                  <th className="py-3 px-4">{t('categories.medsCount')}</th>
                  <th className="py-3 px-4 text-right">{t('common.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/70 dark:bg-slate-900/60">
                {paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {cat.description || t('common.na')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="primary">
                        {cat._count?.medicines ?? 0} {t('pharmacies.medsCount')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCategoryItem(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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

      {/* Pagination Controls */}
      {!isLoading && categories.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={categories.length}
          pageSize={limit}
          pageSizeOptions={[5, 10, 20, 50]}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          itemLabel={t('nav.categories')}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? t('categories.title') : t('categories.addCategory')}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={`${t('categories.categoryName')} *`}
            placeholder="e.g. Syrup, Tablet, Inhaler"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('categories.description')}
            </label>
            <textarea
              rows={3}
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isCreating || isUpdating}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
            >
              {editingCategory ? t('common.save') : t('categories.addCategory')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteCategoryItem)}
        onClose={() => setDeleteCategoryItem(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={`Are you sure you want to delete category "${deleteCategoryItem?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
