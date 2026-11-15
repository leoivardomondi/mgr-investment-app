import React from 'react';

const FEMALE_MEMBER_IDS = new Set(['MGR-002', 'MGR-003']);

const FEMALE_FIRST_NAMES = new Set([
  'sarah', 'alice', 'mary', 'jane', 'grace', 'faith', 'joyce', 'esther', 'ruth',
  'lucy', 'ann', 'anne', 'beatrice', 'catherine', 'diana', 'elizabeth', 'florence',
  'gladys', 'helen', 'irene', 'janet', 'judith', 'linet', 'margaret', 'mercy',
  'millicent', 'nancy', 'pauline', 'phoebe', 'rachel', 'rebecca', 'rose', 'susan',
  'veronica', 'winfred', 'winnie', 'brenda', 'caroline', 'christine', 'dorothy',
  'eunice', 'hannah', 'jacqueline', 'joan', 'josephine', 'lydia', 'martha', 'miriam',
  'monica', 'naomi', 'patricia', 'priscilla', 'stella', 'sylvia', 'teresa', 'violet'
]);

export function getMemberGender(memberOrId, nameFallback = '') {
  if (!memberOrId && !nameFallback) return 'male';

  if (typeof memberOrId === 'object' && memberOrId !== null) {
    if (memberOrId.gender) {
      return memberOrId.gender.toLowerCase() === 'female' ? 'female' : 'male';
    }
    if (memberOrId.id && FEMALE_MEMBER_IDS.has(memberOrId.id)) {
      return 'female';
    }
    const cleanName = (memberOrId.name || nameFallback || '')
      .replace(/\b(Dr|Dr\.|Rev|Rev\.|Prof|Prof\.|Mr|Mr\.|Mrs|Mrs\.|Ms|Ms\.|Miss|PhD|MD|Hon|Eng)\b/gi, '')
      .trim();
    const firstWord = (cleanName.split(/\s+/)[0] || '').toLowerCase();
    if (FEMALE_FIRST_NAMES.has(firstWord)) return 'female';
    if (/\b(Mrs|Mrs\.|Ms|Ms\.|Miss)\b/i.test(memberOrId.name || '')) return 'female';
    return 'male';
  }

  const idStr = String(memberOrId || '');
  if (FEMALE_MEMBER_IDS.has(idStr)) return 'female';

  const cleanFallback = (nameFallback || idStr)
    .replace(/\b(Dr|Dr\.|Rev|Rev\.|Prof|Prof\.|Mr|Mr\.|Mrs|Mrs\.|Ms|Ms\.|Miss|PhD|MD|Hon|Eng)\b/gi, '')
    .trim();
  const firstWord = (cleanFallback.split(/\s+/)[0] || '').toLowerCase();
  if (FEMALE_FIRST_NAMES.has(firstWord)) return 'female';
  return 'male';
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5 rounded-xs',
  sm: 'w-6 h-6 rounded-xs',
  md: 'w-8 h-8 rounded-xs',
  lg: 'w-10 h-10 rounded-xs',
  xl: 'w-11 h-11 rounded-md',
  hero: 'w-14 h-14 sm:w-16 sm:h-16 rounded-md'
};

export default function MemberAvatarIcon({
  member,
  memberId,
  name,
  gender: explicitGender,
  status,
  size = 'md',
  className = '',
  title
}) {
  const resolvedGender = explicitGender || getMemberGender(member || memberId, name || member?.name);
  const resolvedStatus = status || member?.status || 'Active';
  const isDeceased = resolvedStatus === 'Deceased';
  const isFemale = resolvedGender === 'female';

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // Color palette based on gender & status (Archival solid cooperative tones, zero gradients)
  let containerTone = isFemale
    ? 'bg-[#F5E9DF] text-[#7D3C1D] border-[#D9BBA5]'
    : 'bg-[#E6EFE9] text-[#1D3B2A] border-[#B6CBBF]';

  if (isDeceased) {
    containerTone = 'bg-slate-200 text-slate-600 border-slate-300 grayscale';
  }

  const label = title || `${member?.name || name || memberId || 'Member'} (${isFemale ? 'Female' : 'Male'} Member)`;

  return (
    <div
      className={`inline-flex items-center justify-center border shrink-0 overflow-hidden select-none ${sizeClass} ${containerTone} ${className}`}
      title={label}
      aria-label={label}
    >
      {isFemale ? (
        /* Female Face Icon — Styled hair crown, soft jawline, earrings, and blazer collar */
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Shoulders / Executive Collar */}
          <path
            d="M6 35C6 28.8 11.2 25.5 18 25.5C24.8 25.5 30 28.8 30 35"
            fill="currentColor"
            fillOpacity="0.18"
          />
          <path
            d="M8.5 35C8.5 29.8 12.6 26.8 18 26.8C23.4 26.8 27.5 29.8 27.5 35"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* V-Neck Collar & Necklace detail */}
          <path
            d="M14.5 26.8L18 31.2L21.5 26.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Back Hair Silhouette */}
          <path
            d="M10.2 16.5C9.4 11.2 12.8 6.5 18 6.5C23.2 6.5 26.6 11.2 25.8 16.5C26.4 19.6 25.6 22.4 23.8 23.8H12.2C10.4 22.4 9.6 19.6 10.2 16.5Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
          {/* Afro / Crown Bun Accent */}
          <circle
            cx="18"
            cy="6.8"
            r="3.2"
            fill="currentColor"
            fillOpacity="0.85"
          />
          {/* Face Contour */}
          <path
            d="M12.5 15.2C12.5 11.8 14.9 9.5 18 9.5C21.1 9.5 23.5 11.8 23.5 15.2C23.5 19.2 21.1 22.5 18 22.5C14.9 22.5 12.5 19.2 12.5 15.2Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          {/* Parted Hairline */}
          <path
            d="M12.5 14.8C13.8 12.4 16.2 11.2 18 10.6C19.8 11.2 22.2 12.4 23.5 14.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Earrings */}
          <circle cx="11.3" cy="17.3" r="1" fill="currentColor" />
          <circle cx="24.7" cy="17.3" r="1" fill="currentColor" />
          {/* Eyes & Brows */}
          <path d="M14.8 14.6C15.3 14.2 16.1 14.2 16.6 14.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M19.4 14.6C19.9 14.2 20.7 14.2 21.2 14.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="15.7" cy="16" r="1.05" fill="currentColor" />
          <circle cx="20.3" cy="16" r="1.05" fill="currentColor" />
          {/* Gentle Smile */}
          <path
            d="M16.2 19.1C16.8 19.8 17.4 20 18 20C18.6 20 19.2 19.8 19.8 19.1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        /* Male Face Icon — Structured short crop, square jawline, and suit/tie lapels */
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Broad Shoulders & Suit Jacket */}
          <path
            d="M5 35C5 28.5 10.5 25.2 18 25.2C25.5 25.2 31 28.5 31 35"
            fill="currentColor"
            fillOpacity="0.18"
          />
          <path
            d="M7.5 35C7.5 29.4 11.8 26.2 18 26.2C24.2 26.2 28.5 29.4 28.5 35"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          {/* Suit Lapels & Tie */}
          <path
            d="M14.5 26.2L18 31.8L21.5 26.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 28.2V34.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Ears */}
          <path d="M11.8 15.2C11.1 15.2 10.8 16 10.8 16.8C10.8 17.6 11.2 18.2 11.8 18.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24.2 15.2C24.9 15.2 25.2 16 25.2 16.8C25.2 17.6 24.8 18.2 24.2 18.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* Head & Structured Jawline */}
          <path
            d="M12.2 13.8C12.2 10.1 14.6 7.8 18 7.8C21.4 7.8 23.8 10.1 23.8 13.8V16.8C23.8 20.1 21.3 22.6 18 22.6C14.7 22.6 12.2 20.1 12.2 16.8V13.8Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          {/* Short Cropped Hair */}
          <path
            d="M12.2 13.2C12.2 9.8 14.5 7.5 18 7.5C21.5 7.5 23.8 9.8 23.8 13.2C22.4 11.8 20.4 11.2 18 11.2C15.6 11.2 13.6 11.8 12.2 13.2Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          {/* Brows & Eyes */}
          <path d="M14.5 14.3H16.7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M19.3 14.3H21.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <circle cx="15.6" cy="15.9" r="1.05" fill="currentColor" />
          <circle cx="20.4" cy="15.9" r="1.05" fill="currentColor" />
          {/* Confident Expression */}
          <path
            d="M16.1 19.2C16.7 19.7 17.3 19.9 18 19.9C18.7 19.9 19.3 19.7 19.9 19.2"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

