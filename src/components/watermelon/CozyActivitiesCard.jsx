import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Coffee, Dumbbell, Compass, Music, MapPin, Clock } from 'lucide-react';

const COZY_ACTIVITIES = [
  {
    icon: Coffee,
    iconColor: 'var(--color-peach)',
    title: 'Indiranagar Specialty Coffee Trail',
    desc: '3 curated roasteries, pour-overs & quiet book reading',
    time: '2h session',
    badge: 'Popular'
  },
  {
    icon: Dumbbell,
    iconColor: 'var(--color-sky)',
    title: 'Morning Strength & Form Spotting',
    desc: 'Partner workout, deadlift safety & post-gym shake',
    time: '1.5h session',
    badge: 'Fitness'
  },
  {
    icon: Compass,
    iconColor: 'var(--color-emerald)',
    title: 'Heritage Walk & Street Photography',
    desc: 'Old Bangalore alleys, filter coffee & film portraits',
    time: '3h session',
    badge: 'Cultural'
  },
  {
    icon: Music,
    iconColor: 'var(--color-rose)',
    title: 'Acoustic Indie Gig Companion',
    desc: 'Live intimate jazz lounge, safe rides & zero awkwardness',
    time: 'Evenings',
    badge: 'Social'
  }
];

export default function CozyActivitiesCard({ onSelectPlan }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      width: '100%',
      maxWidth: 420,
      margin: '0 auto',
      position: 'relative'
    }}>
      <motion.div
        layout
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        style={{
          borderRadius: 16,
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden'
        }}
      >
        {/* Card Header Accordion Trigger */}
        <motion.button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* 3D Tactile Icon Badge */}
            <motion.div
              animate={{
                width: open ? 44 : 50,
                height: open ? 44 : 50,
                scale: open ? 0.95 : 1
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{
                borderRadius: 12,
                background: 'var(--color-primary-bg)',
                border: '1px solid rgba(250, 110, 94, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Coffee size={20} color="var(--color-primary)" />
            </motion.div>

            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Popular Co-Activities
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {open ? 'Tap items to explore companion matches' : '4 curated verified hangout plans'}
              </p>
            </div>
          </div>

          {/* Spring Rotating Pill Button */}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              flexShrink: 0
            }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.button>

        {/* Expandable Activities List */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '4px 12px 14px 12px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {COZY_ACTIVITIES.map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <motion.div
                      key={act.title}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'var(--bg-elevated)' }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onSelectPlan && onSelectPlan(act)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      {/* Tactile Icon */}
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: act.iconColor,
                        flexShrink: 0
                      }}>
                        <Icon size={17} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {act.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {act.desc}
                        </div>
                      </div>

                      {/* Tag & Time */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(250, 110, 94, 0.1)',
                          color: 'var(--color-primary)',
                          marginBottom: 2
                        }}>
                          {act.badge}
                        </span>
                        <div className="tabular-nums" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {act.time}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
