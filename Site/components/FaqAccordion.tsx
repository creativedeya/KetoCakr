'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Are all desserts strictly ketogenic?',
    a: 'Yes. Every module is calculated to stay within strict ketogenic parameters — minimal glycemic impact, maximum indulgence. All macros are auto-calculated.',
  },
  {
    q: 'Will there be dairy-free or nut-free options?',
    a: 'Yes. The modular system means you can swap any component. Nut allergy? Choose coconut base. Dairy-free? Pick coconut whip. More options added over time.',
  },
  {
    q: 'When is the official launch?',
    a: 'We are currently in the beta phase. Waitlist members get early access before the public launch. Join now to be first in line and help shape the product.',
  },
  {
    q: 'How are macros calculated?',
    a: 'Every component has precise nutritional data. Combine them and the system auto-calculates total calories, fat, protein, and net carbs per serving. No spreadsheets needed.',
  },
  {
    q: 'Is KetoCake Lab free?',
    a: 'Free tier with limited components + premium tier with full library, unlimited combinations, and weekly additions. Waitlist members get a founding member discount.',
  },
  {
    q: 'What sweeteners do you use?',
    a: 'A blend of Erythritol, Allulose, and Monk Fruit extract — for a clean sweet profile without chemical aftertaste. Every blend is calibrated per component.',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-grid">
      {FAQS.map((faq, i) => (
        <div
          key={i}
          className={`faq-item${openIndex === i ? ' open' : ''}`}
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        >
          <div className="faq-q">
            {faq.q}
            <span className="faq-icon">+</span>
          </div>
          <div className="faq-a">{faq.a}</div>
        </div>
      ))}
    </div>
  );
}
