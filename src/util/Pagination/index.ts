interface PaginateOptions {
  page: number;
  limit: number;
}

export async function paginateSupabase<T>(
  query: any,
  { page, limit }: PaginateOptions
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .range(from, to)
    .select('*', { count: 'exact' });

  if (error) throw error;

  return {
    data,
    meta: {
      total: count,
      page,
      lastPage: Math.ceil((count ?? 0) / limit),
    },
  };
}
