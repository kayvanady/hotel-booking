"use client";
import { useAuth } from "@/context/Auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { IoAdd, IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

export default function CommentSection({ comments = [], roomId, hotelId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { user } = useAuth();

  const mainComment = comments.filter(
    (comment) => comment.parentComment == null,
  );

  const replyMap = {};

  const queryClient = useQueryClient()

  comments.forEach((comment) => {
    if (comment.parentComment) {
      const parentId = comment.parentComment.toString();
      if (!replyMap[parentId]) {
        replyMap[parentId] = [];
      }
      replyMap[parentId].push(comment);
    }
  });

  const formDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancellation = () => {
    setModalMessage("");
    setIsModalOpen(false);
  };

  const sendCommentMu = useMutation({
    mutationFn: async (commentData) => {
      const res = await fetch(`/api/comments/send`, {
        method: "POST",
        headers: { "Content-Tupe": "application/json" },
        body: JSON.stringify(commentData),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Comment submited successfully");
      setModalMessage("");
      setIsModalOpen(false);
      
    },
    onError: (err) => {
      console.log(err.message);

      toast.error(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!modalMessage.trim() || modalMessage.trim().length < 5) {
      toast.error("Comment should be at least 5 characters");

      return;
    }
    const commentData = {
      text: modalMessage,
      hotelId,
      roomId,
    };
    sendCommentMu.mutate(commentData);
  };

  return (
    <div className=" mx-auto my-8 px-4 bg-indigo-100/20  rounded-md py-4">
      <section className="flex justify-between items-center ">
        <h1 className="text-gray-700 font-bold text-2xl">
          Comments{comments.length > 0 && ` (${comments.length})`}{" "}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 px-4 py-2 cursor-pointer rounded-md hover:bg-amber-400 transition-colors"
        >
          <IoAdd />
          <span className="font-semibold text-gray-700">Add Comment</span>
        </button>
      </section>
      <section>
        {mainComment.length == 0 ? (
          <h2 className="font-bold text-gray-500 text-2xl my-8 text-center">
            There is no comments yet.
          </h2>
        ) : (
          mainComment.map((comment) => (
            <div
              key={comment._id}
              className="border border-gray-200 rounded-xl bg-white/80 my-8 shadow p-2.5"
            >
              <div className="flex items-center gap-4 my-4 px-2.5">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex justify-center items-center">
                  <span className="font-semibold text-2xl text-amber-600">
                    {comment.user?.name?.[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {comment.user?.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formDate(comment.createdAt)}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 px-3">{comment.text}</p>
              {replyMap[comment._id]?.map((reply) => (
                <div
                  key={reply._id}
                  className="ml-8 my-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
                      A
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">Admin</h3>

                        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Official Reply
                        </span>
                      </div>

                      <span className="text-xs text-gray-500">
                        {formDate(reply.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-7 text-gray-700">
                    {reply.text}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Write a Comment
              </h2>

              <button
                onClick={handleCancellation}
                className="rounded-full p-2 hover:rotate-180 cursor-pointer transition-transform text-gray-400  hover:bg-gray-100 hover:text-gray-700"
              >
                <IoClose size={23} />
              </button>
            </div>

            {!user ? (
              <div className="py-8 text-center">
                <p className="mb-5 text-gray-500">
                  Please login to submit a comment.
                </p>

                <Link
                  href="/auth/login"
                  className="rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-white transition hover:bg-amber-600"
                >
                  Login
                </Link>
              </div>
            ) : (
              <>
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
                    onClick={handleSubmit}
                    disabled={
                      sendCommentMu.isPending || modalMessage.trim().length < 5
                    }
                    className="rounded-lg  cursor-pointer bg-amber-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {sendCommentMu.isPending ? "Sending..." : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
