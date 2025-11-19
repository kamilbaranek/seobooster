export const getArticleGeneratedEmail = (
  articleTitle: string,
  articleImageUrl: string | null,
  status: 'DRAFT' | 'PUBLISHED',
  links: {
    view?: string;
    edit?: string;
    publish?: string;
    feedback: string;
  }
) => {
  const imageHtml = articleImageUrl
    ? `<div style="margin-bottom: 20px;"><img src="${articleImageUrl}" alt="${articleTitle}" style="max-width: 100%; border-radius: 5px;" /></div>`
    : '';

  let ctaHtml = '';
  if (status === 'PUBLISHED') {
    ctaHtml = `
            <div style="margin: 30px 0; display: flex; gap: 10px;">
                ${links.view ? `<a href="${links.view}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">View Article</a>` : ''}
                ${links.edit ? `<a href="${links.edit}" style="background-color: #eaeaea; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Edit in WP</a>` : ''}
            </div>
        `;
  } else {
    ctaHtml = `
            <div style="margin: 30px 0; display: flex; gap: 10px;">
                ${links.publish ? `<a href="${links.publish}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Publish Now</a>` : ''}
                ${links.edit ? `<a href="${links.edit}" style="background-color: #eaeaea; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Edit in WP</a>` : ''}
            </div>
        `;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Article is Ready!</h2>
      <p>We have generated a new article for you: <strong>${articleTitle}</strong></p>
      
      ${imageHtml}
      
      ${ctaHtml}

      <p>If you'd like to provide feedback on this article, please click below:</p>
      <p><a href="${links.feedback}">Rate this article</a></p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #eaeaea;" />
      <p style="color: #666; font-size: 12px;">
        This link will expire in 7 days or after first use.
      </p>
    </div>
  `;

  return {
    subject: `Article Ready: ${articleTitle}`,
    html
  };
};
