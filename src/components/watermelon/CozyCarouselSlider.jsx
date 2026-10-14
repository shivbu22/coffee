import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Heart, MapPin, Star, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const COZY_SLIDES = [
  {
    id: 1,
    name: 'Ananya Sharma',
    city: 'Bengaluru, Indiranagar',
    activity: 'Artisan Cafe Hopping & Pour-Overs',
    rate: '₹450/hr',
    rating: '4.95',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop',
    tag: 'Coffee & Books',
    tagColor: 'var(--color-peach)'
  },
  {
    id: 2,
    name: 'Kabir Verma',
    city: 'Mumbai, Bandra West',
    activity: 'Morning Gym Spotting & Crossfit',
    rate: '₹600/hr',
    rating: '4.98',
    img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    tag: 'Fitness Buddy',
    tagColor: 'var(--color-sky)'
  },
  {
    id: 3,
    name: 'Sneha Patel',
    city: 'Delhi NCR, Hauz Khas',
    activity: 'Heritage Walk & Film Photography',
    rate: '₹500/hr',
    rating: '4.92',
    img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600&auto=format&fit=crop',
    tag: 'Culture & Art',
    tagColor: 'var(--color-rose)'
  },
  {
    id: 4,
    name: 'Rohan Mehra',
    city: 'Bengaluru, Koramangala',
    activity: 'Acoustic Indie Gigs & Concerts',
    rate: '₹550/hr',
    rating: '4.90',
    img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop',
    tag: 'Music & Vibes',
    tagColor: 'var(--color-emerald)'
  }
];

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 180 : -180,
    scale: 0.85,
    opacity: 0,
    rotate: direction > 0 ? 12 : -12,
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
    rotate: 0,
    zIndex: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -180 : 180,
    scale: 0.85,
    opacity: 0,
    rotate: direction > 0 ? -12 : 12,
    zIndex: 0,
  }),
};

export default function CozyCarouselSlider({ onSelectCompanion }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [liked, setLiked] = useState({});

  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-150, 150], [-10, 10]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setIndex((prev) => (prev + newDirection + COZY_SLIDES.length) % COZY_SLIDES.length);
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -80) paginate(1);
    else if (info.offset.x > 80) paginate(-1);
  };

  const current = COZY_SLIDES[index];

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '8px 10px'
    }}>
      {/* Main Polaroid Carousel Stack */}
      <div style={{
        position: 'relative',
        width: 320,
        height: 410,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Background Stack Card (giving tactile physical depth) */}
        <div style={{
          position: 'absolute',
          width: '94%',
          height: '94%',
          background: 'var(--bg-elevated)',
          borderRadius: 16,
          border: '1px solid var(--border-subtle)',
          transform: 'scale(0.97)',
          opacity: 0.7,
          zIndex: 0,
          boxShadow: 'var(--shadow-sm)'
        }} />

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', bounce: 0.15, duration: 0.45 },
              scale: { duration: 0.3 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{
              rotate,
              x: dragX,
              cursor: 'grab',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: 16,
              padding: 12,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            whileTap={{ cursor: 'grabbing' }}
            onDragEnd={handleDragEnd}
            onClick={() => onSelectCompanion && onSelectCompanion(current)}
          >
            {/* Polaroid Photo Frame */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: 260,
              borderRadius: 12,
              overflow: 'hidden',
              background: 'var(--bg-elevated)'
            }}>
              <img
                src={current.img}
                alt={current.name}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              />

              {/* Verified Shield Badge */}
              <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: 'rgba(14, 17, 23, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 9px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--color-emerald)',
                border: '1px solid rgba(56, 178, 156, 0.3)'
              }}>
                <ShieldCheck size={11} />
                <span>AADHAAR VERIFIED</span>
              </div>

              {/* Heart Favorite Button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.8 }}
                onClick={(e) => toggleLike(e, current.id)}
                aria-label={`Favorite ${current.name}`}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.92)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  cursor: 'pointer',
                  color: liked[current.id] ? 'var(--color-rose)' : '#64748b'
                }}
              >
                <Heart size={16} fill={liked[current.id] ? 'var(--color-rose)' : 'none'} />
              </motion.button>

              {/* Category Pill Over Photo Bottom */}
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: 10,
                background: 'rgba(14, 17, 23, 0.9)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: current.tagColor,
                border: '1px solid var(--border-subtle)'
              }}>
                {current.tag}
              </div>
            </div>

            {/* Polaroid Caption Strip */}
            <div style={{
              padding: '10px 4px 2px 4px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {current.name}
                </h3>
                <div className="tabular-nums" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                  <Star size={11} fill="var(--color-gold)" color="var(--color-gold)" />
                  <span>{current.rating}</span>
                </div>
              </div>

              <div style={{
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.35,
                margin: '3px 0 6px 0',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {current.activity}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <MapPin size={11} color="var(--color-primary)" />
                  <span>{current.city.split(',')[1] || current.city}</span>
                </div>
                <div className="tabular-nums" style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {current.rate}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cozy Pagination Controls with Prev/Next */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 18
      }}>
        <button
          type="button"
          onClick={() => paginate(-1)}
          aria-label="Previous companion"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <ChevronLeft size={15} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {COZY_SLIDES.map((slide, i) => (
            <motion.button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              animate={{
                width: i === index ? 22 : 8,
                backgroundColor: i === index ? 'var(--color-primary)' : 'var(--border-hover)'
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{
                height: 8,
                borderRadius: 4,
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Next companion"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
