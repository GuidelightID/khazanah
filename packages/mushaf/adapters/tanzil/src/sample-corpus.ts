import type { TanzilCorpus } from './types.js';

/**
 * Tiny demo corpus (not a full Quran). Suitable for tests and Storybook.
 * Replace with a licensed Tanzil export for production apps.
 */
export const sampleTanzilCorpus: TanzilCorpus = {
  wordsPerPage: 40,
  pageCount: 2,
  surahs: [
    {
      number: 1,
      nameArabic: 'الفاتحة',
      nameSimple: 'Al-Fatihah',
      ayahCount: 7,
      revelationType: 'meccan',
    },
    {
      number: 112,
      nameArabic: 'الإخلاص',
      nameSimple: 'Al-Ikhlas',
      ayahCount: 4,
      revelationType: 'meccan',
    },
  ],
  verses: [
    { verseKey: '1:1', text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', page: 1 },
    { verseKey: '1:2', text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', page: 1 },
    { verseKey: '1:3', text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', page: 1 },
    { verseKey: '1:4', text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ', page: 1 },
    { verseKey: '1:5', text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', page: 1 },
    { verseKey: '1:6', text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', page: 1 },
    {
      verseKey: '1:7',
      text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      page: 1,
    },
    { verseKey: '112:1', text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', page: 2 },
    { verseKey: '112:2', text: 'ٱللَّهُ ٱلصَّمَدُ', page: 2 },
    { verseKey: '112:3', text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', page: 2 },
    { verseKey: '112:4', text: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ', page: 2 },
  ],
};
