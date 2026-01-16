import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Heart, Globe } from 'lucide-react';

export function FatherMessage() {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Celestial background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-500/10 via-transparent to-transparent rounded-full" />
        
        {/* Stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-8"
          >
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span className="text-amber-200 font-medium">{t('vision.fatherMessage.badge')}</span>
          </motion.div>

          {/* Main Quote */}
          <blockquote className="mb-12">
            <p className="font-display text-2xl md:text-4xl lg:text-5xl font-bold leading-relaxed mb-8">
              <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] [text-shadow:_0_2px_0_rgb(0_0_0_/_60%),_0_3px_6px_rgb(0_0_0_/_50%)]">{t('vision.fatherMessage.line1')}</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {t('vision.fatherMessage.line2')}
              </span>
              <br />
              <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] [text-shadow:_0_2px_0_rgb(0_0_0_/_60%),_0_3px_6px_rgb(0_0_0_/_50%)]">{t('vision.fatherMessage.line3')}</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-300">
                {t('vision.fatherMessage.line4')}
              </span>
            </p>
          </blockquote>

          {/* Divider with icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/50" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/50" />
          </motion.div>

          {/* Sub message */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] [text-shadow:_0_1px_2px_rgb(0_0_0_/_50%)]"
          >
            {t('vision.fatherMessage.subMessage')}
          </motion.p>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="inline-flex items-center gap-2 text-amber-300"
          >
            <Heart className="h-5 w-5 animate-pulse" />
            <span className="font-medium">{t('vision.fatherMessage.closing')}</span>
            <Heart className="h-5 w-5 animate-pulse" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
