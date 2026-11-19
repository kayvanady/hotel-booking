"use client";

import { useAuth } from "@/context/Auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";

export default function Comments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [page, setPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState(null);

  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["comments", page],

    queryFn: async () => {
      const res = await fetch(`/api/admin/comments?page=${page}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch comments");
      }

      return result;
    },

    enabled: !!user && user.role === "admin",
  });

  const queryClient = useQueryClient();

  const comments = data?.comments || [];

  const totalComments = data?.totalComments || 0;
  const totalPages = Math.ceil(totalComments / 5);

  const handleApproveMu = useMutation({
    mutationFn: async ({ isApproved, id }) => {
      const res = await fetch(`/api/admin/comments/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Comment ${variables.isApproved ? "approved" : "denied"} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => {
      toast.error(data.message);
    },
  });
  const handleApprove = (isApproved, id) => {
    handleApproveMu.mutate({
      isApproved: !isApproved,
      id,
    });
  };

  const handleCancellation = () => {
    setIsModalOpen(false);
    setModalMessage("");
    setSelectedComment(null);
  };

  const handleDeleteMu = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/comments/${id}/delete`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => {
      toast.error(data.message);
    },
  });
  const handleDelete = (id) => {
    handleDeleteMu.mutate(id);
  };

  const handleModal = (comment) => {
    setSelectedComment(comment);
    setIsModalOpen(true);
  };

  const handleReplyMu = useMutation({
    mutationFn: async (comment) => {
      const res = await fetch(`/api/admin/comments/${comment._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: modalMessage }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Comment replied successfully");
      handleCancellation();
    },
    onError: () => {
      toast.error(data.message);
    },
  });
  const handleReply = () => {
    handleReplyMu.mutate(selectedComment);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="w-14 h-14 border-2 border-amber-600 border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return <p className="p-4 text-red-500">{error.message}</p>;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Comments</h1>
        <p className="text-gray-500 mt-1">Review and manage user comments</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-225 text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-4">#</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Phone</th>
              <th className="px-4 py-4">Comment</th>
              <th className="px-4 py-4">Hotel</th>
              <th className="px-4 py-4">Room</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <tr
                  key={comment._id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-4">{(page - 1) * 5 + index + 1}</td>

                  <td className="px-4 py-4">
                    {comment.user?.name || "Unknown"}
                  </td>

                  <td className="px-4 py-4">{comment.user?.phone || "-"}</td>

                  <td className="px-4 py-4 max-w-xs">{comment.text}</td>
                  <td className="px-4 py-4 max-w-xs">
                    {comment.hotel?.name || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {comment.hotel?.rooms[0]?.roomNumber || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        comment.isApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {comment.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() =>
                          handleApprove(comment.isApproved, comment._id)
                        }
                        title="Approve"
                        className={`${comment.isApproved ? " text-red-700" : "text-green-700"} cursor-pointer transition-transform hover:-translate-y-1`}
                      >
                        {comment.isApproved ? (
                          <IoClose size={28} />
                        ) : (
                          <FaCheck size={20} />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(comment._id)}
                        title="Reject"
                        className="text-red-500  hover:text-red-700 cursor-pointer transition-transform hover:-translate-y-1"
                      >
                        <MdDelete size={22} />
                      </button>

                      <button
                        onClick={() => handleModal(comment)}
                        title="Reply"
                        className="text-blue-600  hover:text-blue-800 cursor-pointer transition-transform hover:-translate-y-1"
                      >
                        <MdModeEdit size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-10 text-center text-gray-500">
                  No comments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Respomdig to {selectedComment.user?.name}
              </h2>

              <button
                onClick={handleCancellation}
                className="rounded-full p-2 hover:rotate-180 cursor-pointer transition-transform text-gray-400  hover:bg-gray-100 hover:text-gray-700"
              >
                <IoClose size={23} />
              </button>
            </div>

            <textarea
              value={modalMessage}
              onChange={(e) => setModalMessage(e.target.value)}
              rows={5}
              maxLength={200}
              placeholder="Write your comment..."
              className="w-full resize-none rounded-xl border border-gray-200 p-4 text-gray-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleCancellation}
                className="rounded-lg px-5  cursor-pointer py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleReply}
                disabled={
                  handleReplyMu.isPending || modalMessage.trim().length < 5
                }
                className="rounded-lg  cursor-pointer bg-amber-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {handleReplyMu.isPending ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setPage((currentPage) => currentPage - 1)}
          disabled={page === 1}
          className="rounded border cursor-pointer border-gray-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span aria-live="polite" className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((currentPage) => currentPage + 1)}
          disabled={page >= totalPages}
          className="rounded border cursor-pointer border-gray-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
