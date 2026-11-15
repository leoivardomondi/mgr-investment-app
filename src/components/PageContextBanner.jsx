import React from 'react';

export default function PageContextBanner({
  eyebrow,
  title,
  description,
  imageUrl,
  imageAlt,
  imageCaption,
  stats = []
}) {
  return (
    <section className="bank-card overflow-hidden border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Left Editorial Explainer */}
        <div className="md:col-span-8 lg:col-span-9 p-4 sm:p-6 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            {eyebrow && (
              <div className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-xs bg-[var(--brand-primary)] inline-block" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)]">
                  {eyebrow}
                </span>
              </div>
            )}
            <h1 className="font-editorial text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed max-w-4xl">
              {description}
            </p>
          </div>

          {stats.length > 0 && (
            <div className="pt-2.5 border-t border-[var(--border-hairline)] grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stats.map((st, idx) => (
                <div key={idx}>
                  <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    {st.label}
                  </span>
                  <span className="font-mono-num text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block">
                    {st.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Documentary Portrait / People Photography */}
        <div className="md:col-span-4 lg:col-span-3 relative min-h-[155px] md:min-h-full bg-[#E6E0D3] border-t md:border-t-0 md:border-l border-[var(--border-hairline)] overflow-hidden">
          <img
            src={imageUrl}
            alt={imageAlt || title}
            loading="lazy"
            className="w-full h-full object-cover object-center max-h-52 md:max-h-none"
          />
          {imageCaption && (
            <div className="absolute bottom-0 inset-x-0 bg-[#1C1917]/85 text-[#F6F3EC] px-3 py-1.5 text-[10px] font-medium tracking-wide border-t border-white/10">
              {imageCaption}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

