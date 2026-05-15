import { TutorModel } from '@features/tutors/tutors.model.js';

export interface SearchQuery {
  subject?: string;
  level?: string;
  location?: string;
  format?: string;
  minRate?: number;
  maxRate?: number;
  verified?: boolean;
  sort?: 'relevance' | 'price' | 'price_desc';
  page?: number;
  limit?: number;
}

class SearchService {
  async search(query: SearchQuery) {
    const {
      subject, level, location, format,
      minRate, maxRate, verified,
      sort = 'relevance',
      page = 1,
      limit = 20,
    } = query;

    // Hard filters — always applied regardless of text search
    const filter: Record<string, unknown> = { isListed: true };
    if (verified !== false) filter['verificationStatus'] = 'verified';
    if (format) filter['format'] = format;
    if (minRate !== undefined || maxRate !== undefined) {
      filter['rate'] = {
        ...(minRate !== undefined ? { $gte: minRate } : {}),
        ...(maxRate !== undefined ? { $lte: maxRate } : {}),
      };
    }

    // Build a single $text search string from all keyword params.
    // Each term is quoted so MongoDB treats it as a phrase, not individual words.
    // This means a tutor whose bio says "I travel to Kaduna" surfaces when
    // location="Kaduna" even though their location field is "Ogbomoso".
    // The text index weights (subjects:10, levels:10, location:8, bio:3) ensure
    // tutors whose actual fields match score higher than bio-mention-only matches.
    const textTerms = [subject, level, location]
      .filter(Boolean)
      .map((t) => `"${t!.trim()}"`)
      .join(' ');

    const skip = (page - 1) * limit;

    if (textTerms) {
      filter['$text'] = { $search: textTerms };

      // When sort=relevance, rank by MongoDB text score (field-weighted).
      // For price sorts we still apply the text filter but sort by rate.
      const sortOption =
        sort === 'price' ? { rate: 1 as const }
        : sort === 'price_desc' ? { rate: -1 as const }
        : { score: { $meta: 'textScore' as const } };

      const projection = textTerms ? { score: { $meta: 'textScore' as const } } : {};

      const [items, total] = await Promise.all([
        TutorModel.find(filter, projection).sort(sortOption).skip(skip).limit(limit).lean(),
        TutorModel.countDocuments(filter),
      ]);

      return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
    }

    // No text terms — plain filter + sort (e.g. browse all online tutors by price)
    const sortOption: Record<string, 1 | -1> =
      sort === 'price' ? { rate: 1 }
      : sort === 'price_desc' ? { rate: -1 }
      : { createdAt: -1 };

    const [items, total] = await Promise.all([
      TutorModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      TutorModel.countDocuments(filter),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }
}

export const searchService = new SearchService();
