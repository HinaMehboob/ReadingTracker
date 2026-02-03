"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase"; // 

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function AddBookModal({ onAddBook }: { onAddBook: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categories, setCategories] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // FIX: Added the missing loading state
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !title) return alert("Title and PDF are required.");

    setLoading(true); // Now this works!

    try {
      const { data, error } = await supabase.from("books").insert([
        {
          title: title,
          author: author || "Unknown Author",
          categories: categories.split(",").map((c) => c.trim()),
          status: "To Read",
          current_page: 0,
          total_pages: 100,
        },
      ]);

      if (error) {
        alert("Error saving book: " + error.message);
      } else {
        setOpen(false);
        setTitle("");
        setAuthor("");
        setCategories("");
        setFile(null);
        onAddBook(); // Refresh the dashboard
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="border-2 border-dashed border-gray-800 rounded-xl h-[300px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 text-gray-500 transition-all">
          <span className="text-3xl">+</span>
          <span className="text-xs mt-2 uppercase font-bold tracking-widest">
            New page
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-[#191919] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add to Library</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Book Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-gray-800"
          />
          <Input
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="bg-transparent border-gray-800"
          />
          <Input
            placeholder="Categories (e.g. Science, Thriller)"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="bg-transparent border-gray-800"
          />
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="bg-transparent border-gray-800"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Book"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
