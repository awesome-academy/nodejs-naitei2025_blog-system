const getArticleLink = (slug: string) => {
  return `/articles/${slug}`;
};

const getDraftArticleLink = (slug: string) => {
  return `articles/draft/${slug}`;
}

const getProfileLink = (username: string) => {
  return `/profile/${username}`;
};

const getTagLink = (tagName: string) => {
  return `/tag/${tagName}`;
};

export { getArticleLink, getDraftArticleLink, getProfileLink, getTagLink };