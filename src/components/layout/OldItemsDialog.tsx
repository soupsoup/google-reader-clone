import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { RETENTION_CHOICES, retentionDays, retentionLabel } from '../../lib/retention';

// Lets a reader hide stories older than 7, 14, 30, 60 or 90 days. The choice is saved on their
// account, so it applies on every device. Starred items are always kept.
export function OldItemsDialog({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [days, setDays] = useState(retentionDays(user));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    // Updating the account fires USER_UPDATED, which refreshes the lists and unread counts.
    const { error } = await supabase.auth.updateUser({ data: { remove_after_days: days } });
    setSaving(false);
    if (error) setError(error.message);
    else onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6"
        role="dialog"
        aria-labelledby="old-items-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="old-items-title" className="text-lg font-semibold text-gray-900">Remove old items</h2>
        <p className="mt-1 text-[14px] text-gray-600">
          Stories older than this disappear from your lists and unread counts. Starred items always stay.
        </p>
        <fieldset className="mt-4 space-y-1">
          <legend className="sr-only">Remove items</legend>
          {RETENTION_CHOICES.map((choice) => (
            <label key={choice} className="flex items-center gap-3 rounded px-2 py-1.5 text-[14px] text-gray-900 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="remove-after"
                value={choice}
                checked={days === choice}
                onChange={() => setDays(choice)}
                className="h-4 w-4 text-[#4285f4]"
              />
              {retentionLabel(choice)}
            </label>
          ))}
        </fieldset>
        <p className="mt-3 text-[12px] text-gray-500">You can change this any time. Choosing "Keep everything" brings hidden stories back.</p>
        {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[14px] rounded bg-gray-100 text-gray-900 hover:bg-gray-200">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-[14px] rounded bg-[#4285f4] text-white hover:bg-[#3367d6] disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
