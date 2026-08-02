"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, Clock, Plus, Sparkles, PartyPopper, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { PALETTE, RADIUS } from "@/lib/palette";
import { Eyebrow, Card, PageHeader, PrimaryButton, SecondaryButton, TextField, ChoiceGroup, LoadingBlock, AiMarkdown } from "@/components/ui/primitives";
import { BookSuggestionsCard } from "@/components/library/BookSuggestionsCard";
import { LocalDateLabel } from "@/components/ui/LocalDateLabel";
import type { Book, LibraryCheckinAnswers, Session } from "@/lib/types";

const RESPONSE_OPTIONS = ["really into it", "okay", "distracted"];
const SPARK_OPTIONS = ["yes", "a little", "not really"];
const REVISIT_OPTIONS = ["yes", "not sure", "move on"];

function isLibraryCheckin(c: Session["checkin"]): c is LibraryCheckinAnswers {
  return Boolean(c && "response" in c);
}

export function LibraryScreen({
  childId,
  childName,
  initialBooks,
  insightsByBook,
  initialBookId,
}: {
  childId: string;
  childName: string;
  initialBooks: Book[];
  insightsByBook: Record<string, Session[]>;
  initialBookId?: string;
}) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [viewing, setViewing] = useState<Book | null>(
    initialBookId ? initialBooks.find((b) => b.id === initialBookId) ?? null : null,
  );
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<Record<string, Session[]>>(insightsByBook);

  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinAnswers, setCheckinAnswers] = useState<Partial<LibraryCheckinAnswers>>({});
  const [noticed, setNoticed] = useState("");
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [microMessage, setMicroMessage] = useState<string | null>(null);

  const [editingBook, setEditingBook] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const checkinComplete = Boolean(checkinAnswers.response && checkinAnswers.sparked_conversation && checkinAnswers.revisit);
  const pastLogs = viewing ? insights[viewing.id] ?? [] : [];

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
      const finalCheckin = { ...checkinAnswers, noticed } as LibraryCheckinAnswers;
      const res = await fetch("/api/library-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          bookId: viewing.id,
          bookTitle: viewing.title,
          bookAuthor: viewing.author,
          whatItTeaches: viewing.what_it_teaches,
          checkin: finalCheckin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckinError(data.error || "Couldn't process that check-in — try again.");
        return;
      }
      setMicroMessage(data.microMessage);
      const newSession: Session = {
        id: data.sessionId ?? crypto.randomUUID(),
        child_id: childId,
        subject: "reading",
        source: "library",
        skill: viewing.title,
        briefing: {
          skill: viewing.title,
          why_it_matters: viewing.what_it_teaches ?? "",
          is_new_concept: false,
          analogies: [],
          household_objects: [],
          followup_questions: [],
          stuck_tip: "",
          alternate_approach: "",
          watch_for: "",
          praise_phrase: "",
          autonomy_tip: "",
          real_life_connection: "",
          estimated_minutes: "",
          math_anxiety_note: "",
        },
        checkin: finalCheckin,
        micro_message: data.microMessage,
        parent_notes: null,
        book_id: viewing.id,
        created_at: new Date().toISOString(),
      };
      setInsights((prev) => ({ ...prev, [viewing.id]: [newSession, ...(prev[viewing.id] ?? [])] }));
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

  function startEditingBook() {
    if (!viewing) return;
    setEditTitle(viewing.title);
    setEditAuthor(viewing.author ?? "");
    setEditError(null);
    setEditingBook(true);
  }

  async function saveBookEdit() {
    if (!viewing || !editTitle.trim()) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/books/${viewing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, author: editAuthor }),
      });
      const data = await res.json();
      if (!res.ok || !data.book) {
        setEditError(data.error || "Couldn't save changes — try again.");
        return;
      }
      const updated: Book = { ...viewing, title: data.book.title, author: data.book.author };
      setBooks((bs) => bs.map((b) => (b.id === updated.id ? updated : b)));
      setViewing(updated);
      setEditingBook(false);
    } catch {
      setEditError("Couldn't save changes — check your connection and try again.");
    } finally {
      setEditSaving(false);
    }
  }

  async function deleteBook() {
    if (!viewing) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/books/${viewing.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Couldn't delete that book — try again.");
        return;
      }
      setBooks((bs) => bs.filter((b) => b.id !== viewing.id));
      setViewing(null);
      setConfirmingDelete(false);
    } catch {
      setDeleteError("Couldn't delete that book — check your connection and try again.");
    } finally {
      setDeleting(false);
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

        {editingBook ? (
          <Card>
            <div className="p-5">
              <Eyebrow color={PALETTE.brand}>Edit book</Eyebrow>
              <TextField label="Title" value={editTitle} onChange={setEditTitle} />
              <TextField label="Author" value={editAuthor} onChange={setEditAuthor} optional />
              {editError && (
                <div className="text-sm mb-3" style={{ color: PALETTE.accent }}>
                  {editError}
                </div>
              )}
              {editSaving ? (
                <LoadingBlock text="Saving..." />
              ) : (
                <div className="flex gap-2.5">
                  <PrimaryButton disabled={!editTitle.trim()} onClick={saveBookEdit}>
                    Save
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setEditingBook(false)}>Cancel</SecondaryButton>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-1">
              <Eyebrow color={PALETTE.brand}>{viewing.author || "Bedtime story guide"}</Eyebrow>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={startEditingBook}
                  aria-label="Edit book"
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: PALETTE.inkSoft }}
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmingDelete(true);
                  }}
                  aria-label="Delete book"
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: PALETTE.accent }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
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
          </>
        )}

        {confirmingDelete && (
          <Card accent="#F0C8B8" tint={PALETTE.accentSoft}>
            <div className="p-5">
              <Eyebrow color={PALETTE.accent}>Remove this book?</Eyebrow>
              <p className="text-sm mb-3" style={{ color: PALETTE.inkSoft }}>
                This removes it from the shelf. Past reading sessions logged for it stay in {childName}&apos;s history.
              </p>
              {deleteError && (
                <div className="text-sm mb-3" style={{ color: PALETTE.accent }}>
                  {deleteError}
                </div>
              )}
              {deleting ? (
                <LoadingBlock text="Removing..." />
              ) : (
                <div className="flex gap-2.5">
                  <button
                    onClick={deleteBook}
                    className="btn-press px-4 py-2 text-sm font-bold rounded-lg"
                    style={{ background: PALETTE.accent, color: "#fff" }}
                  >
                    Yes, remove it
                  </button>
                  <SecondaryButton onClick={() => setConfirmingDelete(false)}>Never mind</SecondaryButton>
                </div>
              )}
            </div>
          </Card>
        )}

        {pastLogs.length > 0 && (
          <Card tint={PALETTE.goldSoft}>
            <div className="p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <NotebookPen size={13} color={PALETTE.gold} />
                <Eyebrow color={PALETTE.gold}>
                  {pastLogs.length === 1 ? "Last time you read this" : `Last ${Math.min(pastLogs.length, 3)} times you read this`}
                </Eyebrow>
              </div>
              <div className="flex flex-col gap-3">
                {pastLogs.slice(0, 3).map((s) => {
                  const cin = isLibraryCheckin(s.checkin) ? s.checkin : null;
                  return (
                    <div key={s.id} className="pb-3 last:pb-0" style={{ borderBottom: `1px solid ${PALETTE.goldLine}` }}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-semibold" style={{ color: PALETTE.inkFaint }}>
                          <LocalDateLabel iso={s.created_at} />
                        </span>
                        {cin && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "#fff", color: PALETTE.brand }}
                          >
                            {cin.response}
                          </span>
                        )}
                      </div>
                      {cin?.noticed && (
                        <p className="text-sm" style={{ color: PALETTE.ink }}>
                          {cin.noticed}
                        </p>
                      )}
                      {s.micro_message && (
                        <p className="text-xs mt-1" style={{ color: PALETTE.inkSoft }}>
                          {s.micro_message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {viewing.what_it_teaches ? (
          <>
            <Card tint={PALETTE.brandSoft}>
              <div className="p-5">
                <Eyebrow color={PALETTE.brand}>What it teaches</Eyebrow>
                <div className="text-sm">
                  <AiMarkdown content={viewing.what_it_teaches ?? ""} />
                </div>
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
                  <div className="text-sm">
                    <AiMarkdown content={viewing.read_aloud_tip ?? ""} />
                  </div>
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
            <div className="p-5 flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <Sparkles size={18} color={PALETTE.gold} className="flex-shrink-0" />
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold mb-0.5">Read this with {childName} tonight?</p>
                <p className="text-xs" style={{ color: PALETTE.inkSoft }}>
                  Log how it went and Easy gets sharper about what she&apos;s ready for next.
                </p>
              </div>
              <button
                onClick={() => setCheckinOpen(true)}
                className="btn-press flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
                style={{ background: "#fff", border: `1px solid ${PALETTE.goldLine}`, color: PALETTE.ink }}
              >
                Log it
              </button>
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
          <BookSuggestionsCard childId={childId} onAdded={(b) => setBooks((prev) => [b, ...prev])} />
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
