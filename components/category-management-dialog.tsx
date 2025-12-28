"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit, Trash2, Tag } from "lucide-react"
import type { Category } from "@/interfaces"

interface CategoryManagementDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCategoriesUpdated: () => void
}

interface CategoryFormData {
    name: string
    description: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function CategoryManagementDialog({
    open,
    onOpenChange,
    onCategoriesUpdated,
}: CategoryManagementDialogProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    )
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
    })

    const getAuthHeader = () => {
        const token = localStorage.getItem("accessToken")
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    }

    // Fetch categories
    const fetchCategories = async () => {
        setIsLoading(true)
        setError("")
        try {
            const response = await fetch(`${API_BASE_URL}/categories`)
            const result = await response.json()

            if (result.success) {
                setCategories(result.data)
            } else {
                setError(result.message || "Failed to load categories")
            }
        } catch (err) {
            console.error("Error fetching categories:", err)
            setError("Failed to load categories")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchCategories()
            setIsFormOpen(false)
            setEditingCategory(null)
            setFormData({ name: "", description: "" })
        }
    }, [open])

    const handleCreateNew = () => {
        setEditingCategory(null)
        setFormData({ name: "", description: "" })
        setIsFormOpen(true)
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
        })
        setIsFormOpen(true)
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError("Category name is required")
            return
        }

        if (!formData.description.trim()) {
            setError("Category description is required")
            return
        }

        setIsSaving(true)
        setError("")

        try {
            const url = editingCategory
                ? `${API_BASE_URL}/admin/categories/${editingCategory.id}`
                : `${API_BASE_URL}/admin/categories`

            const response = await fetch(url, {
                method: editingCategory ? "PUT" : "POST",
                headers: getAuthHeader(),
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (result.success) {
                await fetchCategories()
                onCategoriesUpdated()
                setIsFormOpen(false)
                setFormData({ name: "", description: "" })
                setEditingCategory(null)
            } else {
                setError(result.message || "Failed to save category")
            }
        } catch (err) {
            console.error("Error saving category:", err)
            setError("Failed to save category")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (categoryId: string) => {
        if (!confirm("Are you sure you want to delete this category?")) {
            return
        }

        setIsDeleting(categoryId)
        setError("")

        try {
            const response = await fetch(
                `${API_BASE_URL}/admin/categories/${categoryId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeader(),
                }
            )

            const result = await response.json()

            if (result.success) {
                await fetchCategories()
                onCategoriesUpdated()
            } else {
                setError(result.message || "Failed to delete category")
            }
        } catch (err) {
            console.error("Error deleting category:", err)
            setError("Failed to delete category")
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                    <DialogDescription>
                        Create, edit, or delete event categories
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {/* Category Form */}
                    {isFormOpen && (
                        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                            <h3 className="font-semibold mb-3">
                                {editingCategory
                                    ? "Edit Category"
                                    : "New Category"}
                            </h3>
                            <div className="grid gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="categoryName">Name *</Label>
                                    <Input
                                        id="categoryName"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g., Music, Sports, Art"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="categoryDescription">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="categoryDescription"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        placeholder="Brief description of this category"
                                        rows={2}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        size="sm"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : editingCategory ? (
                                            "Update"
                                        ) : (
                                            "Create"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsFormOpen(false)
                                            setEditingCategory(null)
                                            setFormData({
                                                name: "",
                                                description: "",
                                            })
                                        }}
                                        size="sm"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create Button */}
                    {!isFormOpen && (
                        <Button
                            onClick={handleCreateNew}
                            variant="outline"
                            className="w-full mb-4"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Category
                        </Button>
                    )}

                    {/* Categories List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Tag className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No categories yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="default">
                                                    {category.name}
                                                </Badge>
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleEdit(category)
                                                }
                                                disabled={isFormOpen}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(category.id)
                                                }
                                                disabled={
                                                    isDeleting ===
                                                        category.id ||
                                                    isFormOpen
                                                }
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                {isDeleting === category.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
