"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, Clock, Plus, Sparkles, PartyPopper } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Eyebrow, Card, PageHeader, PrimaryButton, SecondaryButton, TextField, ChoiceGroup, LoadingBlock } from "@/components/ui/primitives";
import type { Book, LibraryCheckinAnswers } from "@/lib/types";

const RESPONSE_OPTIONS = ["really into it", "okay", "distracted"];
const SPARK_OPTIONS = ["yes", "a little", "not really"];
const REVISIT_OPTIONS = ["yes", "not sure", "move on"];

export function LibraryScreen({
  childId,
  childName,
  initialBooks,
}: {
  childId: string;
  childName: string;
  initialBooks: Book[];
}) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [viewing, setViewing] = useState<Book | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinAnswers, setCheckinAnswers] = useState<Partial<LibraryCheckinAnswers>>({});
  const [noticed, setNoticed] = useState("");
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [microMessage, setMicroMessage] = useState<string | null>(null);

  const checkinComplete = Boolean(checkinAnswers.response && checkinAnswers.sparked_conversation && checkinAnswers.revisit);

  function resetCheckin() {
    setCheckinOpen(false);
    setCheckinAnswers({});
    setNoticed("");
    setCheckinError(null);
    setMicroMessage(null);
  }

  async function submitCheckin() {
    if (!viewing || !checkinComplete) return;
    setCheckinSubmitting(true);
    setCheckinError(null);
    try {
      const res = await fetch("/api/library-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          bookTitle: viewing.title,
          bookAuthor: viewing.author,
          whatItTeaches: viewing.what_it_teaches,
          checkin: { ...checkinAnswers, noticed } as LibraryCheckinAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckinError(data.error || "Couldn't process that check-in — try again.");
        return;
      }
      setMicroMessage(data.microMessage);
    } catch {
      setCheckinError("Couldn't process that check-in — check your connection and try again.");
    } finally {
      setCheckinSubmitting(false);
    }
  }

  async function addBook() {
    if (!title.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, title, author }),
      });
      const data = await res.json();
      if (!res.ok || !data.book) {
        setError(data.error || "Couldn't add that book — try again.");
        return;
      }
      setBooks((b) => [data.book, ...b]);
      setTitle("");
      setAuthor("");
      setViewing(data.book);
    } catch {
      setError("Couldn't add that book — check your connection and try again.");
    } finally {
      setAdding(false);
    }
  }

  if (viewing) {
    return (
      <div className="animate-fade-in-up max-w-[760px] mx-auto">
        <button
          onClick={() => {
            setViewing(null);
            resetCheckin();
          }}
          className="flex items-center gap-1 mb-4 text-sm"
          style={{ color: PALETTE.inkSoft }}
        >
          <ChevronLeft size={16} /> Library
        </button>

        <Eyebrow color={PALETTE.brand}>{viewing.author || "Bedtime story guide"}</Eyebrow>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-serif-display font-bold" style={{ fontSize: 21 }}>{viewing.title}</h2>
          {viewing.estimated_minutes && (
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
              style={{ background: PALETTE.brandSoft, color: PALETTE.brand }}
            >
              <Clock size={11} /> {viewing.estimated_minutes}
            </span>
          )}
        </div>

        {viewing.what_it_teaches ? (
          <>
            <Card tint={PALETTE.brandSoft}>
              <div className="p-5">
                <Eyebrow color={PALETTE.brand}>What it teaches</Eyebrow>
                <div className="text-sm">{viewing.what_it_teaches}</div>
              </div>
            </Card>
            {viewing.discussion_questions && viewing.discussion_questions.length > 0 && (
              <Card>
                <div className="p-5">
                  <Eyebrow>Discussion questions</Eyebrow>
                  {viewing.discussion_questions.map((q, i) => (
                    <div key={i} className="text-sm mb-1.5">💬 {q}</div>
                  ))}
                </div>
              </Card>
            )}
            {viewing.read_aloud_tip && (
              <Card>
                <div className="p-5">
                  <Eyebrow>Read-aloud tip</Eyebrow>
                  <div className="text-sm">{viewing.read_aloud_tip}</div>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <div className="p-5 text-sm" style={{ color: PALETTE.inkSoft }}>
              Easy couldn&apos;t put together a guide for this one — you know this book better than any AI will anyway.
            </div>
          </Card>
        )}

        {microMessage ? (
          <Card tint={PALETTE.brandSoft}>
            <div className="p-5 flex items-start gap-3">
              <PartyPopper size={20} color={PALETTE.brand} className="flex-shrink-0 mt-0.5" />
              <div>
                <Eyebrow color={PALETTE.brand}>Nice work</Eyebrow>
                <div className="text-sm font-semibold">{microMessage}</div>
              </div>
            </div>
          </Card>
        ) : checkinOpen ? (
          <Card>
            <div className="p-5">
              <Eyebrow color={PALETTE.brand}>Reading check-in</Eyebrow>
              <ChoiceGroup
                label={`How did ${childName} respond?`}
                options={RESPONSE_OPTIONS}
                value={checkinAnswers.response ?? ""}
                onChange={(v) => setCheckinAnswers((a) => ({ ...a, response: v as LibraryCheckinAnswers["response"] }))}
              />
              <ChoiceGroup
                label="Did the discussion questions spark real conversation?"
                options={SPARK_OPTIONS}
                value={checkinAnswers.sparked_conversation ?? ""}
                onChange={(v) => setCheckinAnswers((a) => ({ ...a, sparked_conversation: v as LibraryCheckinAnswers["sparked_conversation"] }))}
              />
              <ChoiceGroup
                label="Revisit this book again, or move on to something new?"
                options={REVISIT_OPTIONS}
                value={checkinAnswers.revisit ?? ""}
                onChange={(v) => setCheckinAnswers((a) => ({ ...a, revisit: v as LibraryCheckinAnswers["revisit"] }))}
              />
              <TextField
                label="Anything they said that surprised you, or how they're thinking about the theme?"
                value={noticed}
                onChange={setNoticed}
                optional
              />
              {checkinError && (
                <div className="text-sm mb-3" style={{ color: PALETTE.accent }}>
                  {checkinError}
                </div>
              )}
              {checkinSubmitting ? (
                <LoadingBlock text="Easy is thinking about tonight..." />
              ) : (
                <div className="flex gap-2.5">
                  <PrimaryButton disabled={!checkinComplete} onClick={submitCheckin}>
                    Done
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setCheckinOpen(false)}>Cancel</SecondaryButton>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card tint={PALETTE.goldSoft}>
            <div className="p-5 flex items-center gap-3">
              <Sparkles size={18} color={PALETTE.gold} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-0.5">Read this with {childName} tonight?</p>
                <p className="text-xs" style={{ color: PALETTE.inkSoft }}>
                  Log how it went and Easy gets sharper about what she&apos;s ready for next.
                </p>
              </div>
              <SecondaryButton onClick={() => setCheckinOpen(true)}>Log it</SecondaryButton>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        icon={<BookOpen size={20} color={PALETTE.brand} />}
        color={PALETTE.brand}
        soft={PALETTE.brandSoft}
        eyebrow="Library"
        title="Bedtime story guide"
        subtitle="Themes and discussion questions for books you already have"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_336px] gap-5 items-start">
        <div className="flex flex-col gap-5 min-w-0">
          <Card style={{ marginBottom: 0 }}>
            <div className="p-5 pb-3">
              <Eyebrow>Your shelf</Eyebrow>
            </div>
            {books.length === 0 ? (
              <div className="px-5 pb-5 text-sm" style={{ color: PALETTE.inkSoft }}>
                No books yet — add one from the shelf panel and Easy will put together a reading guide for {childName}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 px-5 pb-5">
                {books.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setViewing(b)}
                    className="btn-press text-left rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                    style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.line}` }}
                  >
                    <div
                      className="flex items-center justify-center mb-3"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.sm, background: PALETTE.brand, transform: "rotate(-6deg)" }}
                    >
                      <BookOpen size={17} color="#fff" />
                    </div>
                    <div className="text-sm font-bold mb-0.5 leading-snug">{b.title}</div>
                    {b.author && (
                      <div className="text-xs" style={{ color: PALETTE.inkSoft }}>
                        {b.author}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <Card style={{ marginBottom: 0 }}>
            <div className="p-5">
              <Eyebrow color={PALETTE.brand}>Add a book from your shelf</Eyebrow>
              <TextField label="Title" value={title} onChange={setTitle} placeholder="e.g. Goodnight Moon" />
              <TextField label="Author" value={author} onChange={setAuthor} optional />
              {error && (
                <div className="text-sm mb-3" style={{ color: PALETTE.accent }}>
                  {error}
                </div>
              )}
              {adding ? (
                <LoadingBlock text="Reading up on this one..." />
              ) : (
                <PrimaryButton disabled={!title.trim()} onClick={addBook} icon={Plus}>
                  Add to shelf
                </PrimaryButton>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
