import { useState, useCallback, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Requests } from "../api";

interface MoodTrackerProps {
  onEntryAdded?: () => void;
}

export const MoodTracker = ({ onEntryAdded }: MoodTrackerProps) => {
  const { user, setUser } = useAuth();
  const [mood, setMood] = useState<string>("neutral");
  const [hoursWorkedOut, setHoursWorkedOut] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const moodOptions = [
    { value: "happy", label: "😊 Happy", emoji: "😊" },
    { value: "sad", label: "😢 Sad", emoji: "😢" },
    { value: "excited", label: "😄 Excited", emoji: "😄" },
    { value: "mad", label: "😠 Mad", emoji: "😠" },
    { value: "angry", label: "😡 Angry", emoji: "😡" },
    { value: "tired", label: "😴 Tired", emoji: "😴" },
    { value: "stressed", label: "😰 Stressed", emoji: "😰" },
    { value: "neutral", label: "😐 Neutral", emoji: "😐" },
    { value: "anxious", label: "😨 Anxious", emoji: "😨" },
    { value: "calm", label: "😌 Calm", emoji: "😌" },
    { value: "frustrated", label: "😤 Frustrated", emoji: "😤" },
    { value: "content", label: "🙂 Content", emoji: "🙂" },
    { value: "energetic", label: "⚡ Energetic", emoji: "⚡" },
    { value: "overwhelmed", label: "😵 Overwhelmed", emoji: "😵" },
    { value: "peaceful", label: "☮ Peaceful", emoji: "☮" },
    { value: "motivated", label: "💪 Motivated", emoji: "💪" },
    { value: "grateful", label: "🙏 Grateful", emoji: "🙏" },
    { value: "hopeful", label: "🤞 Hopeful", emoji: "🤞" },
    { value: "lonely", label: "🥺 Lonely", emoji: "🥺" },
    { value: "confident", label: "😎 Confident", emoji: "😎" },
    { value: "bored", label: "🥱 Bored", emoji: "🥱" },
    { value: "scared", label: "😱 Scared", emoji: "😱" },
    { value: "jealous", label: "😒 Jealous", emoji: "😒" },
    { value: "embarrassed", label: "😳 Embarrassed", emoji: "😳" },
    { value: "surprised", label: "😲 Surprised", emoji: "😲" },
    { value: "proud", label: "🥰 Proud", emoji: "🥰" },
    { value: "shy", label: "🤭 Shy", emoji: "🤭" },
    { value: "relieved", label: "😌 Relieved", emoji: "😌" },
    { value: "disappointed", label: "😞 Disappointed", emoji: "😞" },
    { value: "guilty", label: "😔 Guilty", emoji: "😔" },
    { value: "curious", label: "🧐 Curious", emoji: "🧐" },
    { value: "silly", label: "🤪 Silly", emoji: "🤪" },
    { value: "loved", label: "❤️ Loved", emoji: "❤️" },
    { value: "sick", label: "🤒 Sick", emoji: "🤒" },
    { value: "hungry", label: "😋 Hungry", emoji: "😋" },
    { value: "thirsty", label: "🥤 Thirsty", emoji: "🥤" },
    { value: "busy", label: "🏃 Busy", emoji: "🏃" },
    { value: "focused", label: "🎯 Focused", emoji: "🎯" },
    { value: "creative", label: "🎨 Creative", emoji: "🎨" },
    { value: "inspired", label: "✨ Inspired", emoji: "✨" },
    { value: "nostalgic", label: "📸 Nostalgic", emoji: "📸" },
    { value: "relaxed", label: "🛀 Relaxed", emoji: "🛀" },
    { value: "worried", label: "😟 Worried", emoji: "😟" },
    { value: "optimistic", label: "🌈 Optimistic", emoji: "🌈" },
    { value: "pessimistic", label: "🌧️ Pessimistic", emoji: "🌧️" },
    { value: "apathetic", label: "😑 Apathetic", emoji: "😑" },
    { value: "ashamed", label: "😳 Ashamed", emoji: "😳" },
    { value: "resentful", label: "😒 Resentful", emoji: "😒" },
    { value: "hurt", label: "🤕 Hurt", emoji: "🤕" },
    { value: "secure", label: "🔒 Secure", emoji: "🔒" },
    { value: "unsafe", label: "🚫 Unsafe", emoji: "🚫" },
    { value: "other", label: "❓ Other", emoji: "❓" },
  ];

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

      if (!mood) {
        setError("Please select a mood");
        return;
      }

      setIsSubmitting(true);
      try {
        const newEntry = await Requests.createMoodEntry({
          mood,
          hoursWorkedOut: hoursWorkedOut ? parseFloat(hoursWorkedOut) : 0,
          notes: notes.trim() || undefined,
        });

        // Update user state with new entry
        if (user) {
          setUser({
            ...user,
            moodEntries: [...(user.moodEntries || []), newEntry],
          });
        }

        // Reset form
        setMood("neutral");
        setHoursWorkedOut("");
        setNotes("");
        // Fire a custom event for global listeners (e.g., MoodEntries page)
        window.dispatchEvent(new Event("moodEntryAdded"));
        onEntryAdded?.();
      } catch (err: any) {
        console.error("Failed to add mood entry:", err);
        setError(err.response?.data?.error || "Failed to add entry");
      } finally {
        setIsSubmitting(false);
      }
    },
    [mood, hoursWorkedOut, notes, user, setUser, onEntryAdded]
  );

  const handleMoodChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMood(e.target.value);
    setError("");
  }, []);

  const handleNotesChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setNotes(e.target.value);
    },
    []
  );

  return (
    <div className="w-full p-2 border bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-lg shadow-lg">
      <h2 className="text-base font-semibold mb-2">Mood Tracker</h2>
      {error && (
        <div className="bg-red-500 text-white p-1 rounded mb-1 text-xs">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Mood Selection - Radio Buttons */}
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">
            How are you feeling?
          </label>
          <div className="grid grid-cols-4 md:grid-cols-10 gap-1">
            {moodOptions.map((option) => (
              <label
                key={option.value}
                className={`flex flex-col items-center p-1 rounded border-2 cursor-pointer transition ${
                  mood === option.value
                    ? "bg-purple-600 border-purple-400"
                    : "bg-purple-800 border-purple-700 hover:bg-purple-700"
                } text-xs`}
              >
                <input
                  type="radio"
                  name="mood"
                  value={option.value}
                  checked={mood === option.value}
                  onChange={handleMoodChange}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <span className="text-base">{option.emoji}</span>
                <span className="mt-0.5">{option.label.split(" ")[1]}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Hours Worked Out and Notes - Side by Side */}
        <div className="flex gap-2 mb-1">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-0.5">💪 Hours</label>
            <input
              type="number"
              value={hoursWorkedOut}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setHoursWorkedOut(e.target.value)
              }
              placeholder="0"
              min="0"
              max="24"
              step="0.5"
              className="w-full border rounded p-1 text-black text-xs"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-0.5">Notes</label>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Notes..."
              className="w-full border rounded p-1 text-black resize-none text-xs"
              rows={1}
              maxLength={500}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-orange-600 text-white rounded px-3 py-1 text-xs hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Mood Entry"}
        </button>
      </form>
    </div>
  );
};
