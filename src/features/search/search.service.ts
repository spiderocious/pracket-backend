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

    const filter: Record<string, unknown> = { isListed: true };

    if (verified !== false) filter['verificationStatus'] = 'verified';
    if (subject) filter['subjects'] = { $regex: subject, $options: 'i' };
    if (level) filter['levels'] = { $regex: level, $options: 'i' };
    if (location) filter['location'] = { $regex: location, $options: 'i' };
    if (format) filter['format'] = format;
    if (minRate !== undefined || maxRate !== undefined) {
      filter['rate'] = {
        ...(minRate !== undefined ? { $gte: minRate } : {}),
        ...(maxRate !== undefined ? { $lte: maxRate } : {}),
      };
    }

    const sortOption: Record<string, 1 | -1> =
      sort === 'price' ? { rate: 1 }
      : sort === 'price_desc' ? { rate: -1 }
      : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      TutorModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      TutorModel.countDocuments(filter),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }
}

export const searchService = new SearchService();
