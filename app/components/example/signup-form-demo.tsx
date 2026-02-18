"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock3, ImagePlus, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { Tweet } from "react-tweet";
import { Post } from "bsky-react-post";
import "../../styles/bsky-embed.css";

type FilePreview = {
  file: File;
  url: string;
};

type ParsedEmbed = {
  url: string;
  type: "twitter" | "bsky" | "unsupported";
  tweetId?: string;
  handle?: string;
  postId?: string;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDaySuffix = (day: number) => {
  if (day >= 11 && day <= 13) return "th";
  const lastDigit = day % 10;
  if (lastDigit === 1) return "st";
  if (lastDigit === 2) return "nd";
  if (lastDigit === 3) return "rd";
  return "th";
};

const formatTimelineDate = (date: Date) => {
  const day = date.getDate();
  const dayWithSuffix = `${day}${getDaySuffix(day)}`;
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${dayWithSuffix} ${month}, ${year} ${hours}:${minutes}`;
};

const parseTwitterId = (url: string) => {
  const match = url.match(/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/);
  return match?.[1] ?? null;
};

const parseBlueskyPost = (url: string) => {
  const match = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/);
  if (!match) return null;
  return { handle: match[1], postId: match[2] };
};

const parseEmbed = (url: string): ParsedEmbed => {
  const tweetId = parseTwitterId(url);
  if (tweetId) {
    return { url, type: "twitter", tweetId };
  }

  const bluesky = parseBlueskyPost(url);
  if (bluesky) {
    return { url, type: "bsky", handle: bluesky.handle, postId: bluesky.postId };
  }

  return { url, type: "unsupported" };
};

export default function SignupFormDemo() {
  const { status } = useSession();
  const router = useRouter();

  const [userLog, setUserLog] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [embeds, setEmbeds] = useState<string[]>([""]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const datePickerRef = useRef<HTMLDivElement>(null);

  const validEmbeds = useMemo(
    () => embeds.map((item) => item.trim()).filter(Boolean),
    [embeds]
  );
  const parsedEmbeds = useMemo(
    () => validEmbeds.map((url) => parseEmbed(url)),
    [validEmbeds]
  );

  useEffect(() => {
    const previews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setFilePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedFiles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const monthYearLabel = useMemo(
    () =>
      calendarMonth.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [calendarMonth]
  );

  const dayGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<number | null> = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calendarMonth]);

  const updateTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
    const next = new Date(scheduledDate);
    next.setHours(hours, minutes, 0, 0);
    setScheduledDate(next);
  };

  const selectCalendarDay = (day: number) => {
    const next = new Date(scheduledDate);
    next.setFullYear(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    setScheduledDate(next);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleEmbedChange = (index: number, value: string) => {
    setEmbeds((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addEmbedField = () => {
    setEmbeds((prev) => [...prev, ""]);
  };

  const removeEmbedField = (index: number) => {
    setEmbeds((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, embedIndex) => embedIndex !== index);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userLog.trim()) {
      alert("Dude, the log is empty. Seriously?");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("content[text]", userLog.trim());
    formData.append("content[date]", scheduledDate.toISOString());

    selectedFiles.forEach((file, index) => {
      formData.append(`content[media][mediaItems][${index}]`, file);
    });

    validEmbeds.forEach((embed, index) => {
      formData.append(
        `content[media][mediaItems][${selectedFiles.length + index}]`,
        JSON.stringify({
          type: "embed",
          platform: embed.includes("twitter") || embed.includes("x.com") ? "twitter" : "bsky",
          url: embed,
        })
      );
    });

    formData.append("content[media][isImageAvailable]", String(selectedFiles.length > 0));
    formData.append("content[media][isEmbedAvailable]", String(validEmbeds.length > 0));

    try {
      await axios.post("https://workers.aruparekh2.workers.dev/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Could not publish this log right now. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className='min-h-screen bg-black px-4 py-10 text-white'>
        <section className='mx-auto flex max-w-md items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-8'>
          <Loader2 className='h-5 w-5 animate-spin text-neutral-400' />
        </section>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className='min-h-screen bg-black px-4 py-10 text-white'>
        <section className='mx-auto flex max-w-md flex-col items-center rounded-2xl border border-neutral-800 bg-neutral-950 p-7 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>Authentication required</h1>
          <p className='mt-3 text-sm text-neutral-400'>
            Sign in to publish a new changelog entry.
          </p>
          <button
            className='mt-6 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium transition hover:border-neutral-500'
            onClick={() => router.push("/api/auth/signin")}
          >
            Log in
          </button>
        </section>
      </main>
    );
  }

  const selectedHour = String(scheduledDate.getHours()).padStart(2, "0");
  const selectedMinute = String(scheduledDate.getMinutes()).padStart(2, "0");

  return (
    <main className='min-h-screen bg-black px-4 py-8 text-white md:px-8 md:py-10'>
      <div className='mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
        <section className='rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:p-7'>
          <div className='mb-7 space-y-2'>
            <p className='text-xs uppercase tracking-[0.18em] text-neutral-500'>New Log</p>
            <h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>Create a changelog entry</h1>
            <p className='text-sm text-neutral-400'>
              Keep it short, visual, and timestamped. This will be published to your journey timeline.
            </p>
          </div>

          <form className='space-y-7' onSubmit={handleUpload}>
            <div className='space-y-2'>
              <label className='text-xs uppercase tracking-[0.14em] text-neutral-500'>Date & time</label>
              <div ref={datePickerRef} className='relative'>
                <button
                  type='button'
                  className='flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-left transition hover:border-neutral-700'
                  onClick={() => setIsDatePickerOpen((prev) => !prev)}
                >
                  <span className='inline-flex items-center gap-2 text-sm text-neutral-200'>
                    <CalendarDays className='h-4 w-4 text-neutral-400' />
                    {scheduledDate.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Calendar className='h-4 w-4 text-neutral-500' />
                </button>

                {isDatePickerOpen && (
                  <div className='absolute z-50 mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 p-4 shadow-[0_16px_60px_rgba(0,0,0,0.45)]'>
                    <div className='mb-3 flex items-center justify-between'>
                      <button
                        type='button'
                        className='rounded-md border border-neutral-800 p-1.5 text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-200'
                        onClick={() =>
                          setCalendarMonth(
                            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                          )
                        }
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </button>
                      <p className='text-sm font-medium text-neutral-200'>{monthYearLabel}</p>
                      <button
                        type='button'
                        className='rounded-md border border-neutral-800 p-1.5 text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-200'
                        onClick={() =>
                          setCalendarMonth(
                            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                          )
                        }
                      >
                        <ChevronRight className='h-4 w-4' />
                      </button>
                    </div>

                    <div className='mb-2 grid grid-cols-7 gap-1'>
                      {weekDays.map((day) => (
                        <span
                          key={day}
                          className='py-1 text-center text-[11px] uppercase tracking-[0.1em] text-neutral-500'
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    <div className='grid grid-cols-7 gap-1'>
                      {dayGrid.map((day, index) => {
                        if (!day) {
                          return <span key={`empty-${index}`} className='h-9 rounded-md' />;
                        }

                        const isSelected =
                          day === scheduledDate.getDate() &&
                          calendarMonth.getMonth() === scheduledDate.getMonth() &&
                          calendarMonth.getFullYear() === scheduledDate.getFullYear();

                        return (
                          <button
                            key={day}
                            type='button'
                            onClick={() => selectCalendarDay(day)}
                            className={`h-9 rounded-md text-sm transition ${
                              isSelected
                                ? "bg-neutral-200 text-black"
                                : "text-neutral-300 hover:bg-neutral-800"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    <div className='mt-4 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2'>
                      <Clock3 className='h-4 w-4 text-neutral-500' />
                      <input
                        type='time'
                        className='w-full bg-transparent text-sm text-neutral-200 outline-none'
                        value={`${selectedHour}:${selectedMinute}`}
                        onChange={(event) => updateTime(event.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <label htmlFor='log' className='text-xs uppercase tracking-[0.14em] text-neutral-500'>
                Log text
              </label>
              <textarea
                id='log'
                name='text'
                value={userLog}
                onChange={(event) => setUserLog(event.target.value)}
                placeholder='Shipped a cleaner changelog editor and improved the timeline reading experience.'
                className='min-h-32 w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-sm leading-relaxed text-neutral-100 outline-none transition focus:border-neutral-600'
                required
              />
            </div>

            <div className='space-y-3'>
              <label htmlFor='images' className='text-xs uppercase tracking-[0.14em] text-neutral-500'>
                Images
              </label>
              <label
                htmlFor='images'
                className='flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/60 px-4 py-4 text-sm text-neutral-300 transition hover:border-neutral-500'
              >
                <ImagePlus className='h-4 w-4 text-neutral-500' />
                Upload one or more images
              </label>
              <input
                id='images'
                type='file'
                accept='image/*'
                multiple
                onChange={handleFileChange}
                className='hidden'
              />

              {filePreviews.length > 0 && (
                <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                  {filePreviews.map((preview, index) => (
                    <div
                      key={`${preview.file.name}-${index}`}
                      className='relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900'
                    >
                      <div className='relative h-28 w-full md:h-32'>
                        <Image
                          src={preview.url}
                          alt={preview.file.name}
                          fill
                          unoptimized
                          className='object-cover'
                          sizes='(min-width: 768px) 220px, 40vw'
                        />
                      </div>
                      <div className='flex items-center justify-between gap-2 border-t border-neutral-800 px-2 py-1.5'>
                        <span className='truncate text-[11px] text-neutral-400'>{preview.file.name}</span>
                        <button
                          type='button'
                          onClick={() => removeFile(index)}
                          className='rounded-md p-1 text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-200'
                          aria-label='Remove image'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <label className='text-xs uppercase tracking-[0.14em] text-neutral-500'>Embeds</label>
                <button
                  type='button'
                  onClick={addEmbedField}
                  className='inline-flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 transition hover:border-neutral-500'
                >
                  <Plus className='h-3.5 w-3.5' />
                  Add
                </button>
              </div>

              <div className='space-y-2'>
                {embeds.map((embed, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <div className='flex flex-1 items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3'>
                      <Link2 className='h-4 w-4 text-neutral-500' />
                      <input
                        type='url'
                        placeholder='https://x.com/... or https://bsky.app/profile/.../post/...'
                        value={embed}
                        onChange={(event) => handleEmbedChange(index, event.target.value)}
                        className='h-11 w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-500'
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() => removeEmbedField(index)}
                      className='rounded-md border border-neutral-800 bg-neutral-900 p-2 text-neutral-500 transition hover:border-neutral-600 hover:text-neutral-200'
                      aria-label='Remove embed'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {uploadError && (
              <p className='rounded-lg border border-red-900/60 bg-red-950/35 px-3 py-2 text-sm text-red-300'>
                {uploadError}
              </p>
            )}

            <button
              type='submit'
              disabled={isUploading}
              className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-100 px-4 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70'
            >
              {isUploading ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
              {isUploading ? "Publishing..." : "Publish log"}
            </button>
          </form>
        </section>

        <aside className='space-y-6'>
          <section className='rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:p-6'>
            <p className='text-xs uppercase tracking-[0.14em] text-neutral-500'>Live preview</p>
            <div className='mt-4 space-y-4'>
              <p className='text-2xl font-semibold leading-[1.1] text-neutral-400'>
                {formatTimelineDate(scheduledDate)}
              </p>

              <div className='rounded-xl border border-neutral-800 bg-black/60 p-4'>
                <p className='whitespace-pre-wrap text-sm leading-relaxed text-neutral-200'>
                  {userLog.trim() || "Your log text will appear here."}
                </p>
              </div>

              {filePreviews.length > 0 && (
                <div className='grid grid-cols-2 gap-3'>
                  {filePreviews.map((preview, index) => (
                    <div key={`${preview.file.name}-preview-${index}`} className='relative h-28 overflow-hidden rounded-xl border border-neutral-800'>
                      <Image
                        src={preview.url}
                        alt={preview.file.name}
                        fill
                        unoptimized
                        className='object-cover'
                        sizes='(min-width: 1024px) 280px, 42vw'
                      />
                    </div>
                  ))}
                </div>
              )}

              {parsedEmbeds.length > 0 && (
                <div className='space-y-3'>
                  {parsedEmbeds.map((embed) => {
                    if (embed.type === "twitter" && embed.tweetId) {
                      return (
                        <div key={embed.url} className='overflow-hidden rounded-xl'>
                          <Tweet id={embed.tweetId} />
                        </div>
                      );
                    }

                    if (embed.type === "bsky" && embed.handle && embed.postId) {
                      return (
                        <div key={embed.url} className='overflow-hidden rounded-xl'>
                          <Post handle={embed.handle} id={embed.postId} />
                        </div>
                      );
                    }

                    return (
                      <a
                        key={embed.url}
                        href={embed.url}
                        target='_blank'
                        rel='noreferrer'
                        className='block rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-400 transition hover:text-neutral-200'
                      >
                        Preview unavailable for this URL. Open link.
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className='rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:p-6'>
            <p className='text-xs uppercase tracking-[0.14em] text-neutral-500'>Tips</p>
            <ul className='mt-3 space-y-2 text-sm text-neutral-400'>
              <li>Use one concise sentence for max timeline readability.</li>
              <li>Images display best when at least 1200px wide.</li>
              <li>Supported embed previews: X/Twitter and Bluesky post URLs.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
