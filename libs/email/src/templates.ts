export const getArticleGeneratedEmail = (
    articleTitle: string,
    publishLink: string,
    feedbackLink: string
) => {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Article is Ready!</h2>
      <p>We have generated a new article for you: <strong>${articleTitle}</strong></p>
      
      <div style="margin: 30px 0;">
        <a href="${publishLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Publish Now
        </a>
      </div>

      <p>If you'd like to provide feedback on this article, please click below:</p>
      <p><a href="${feedbackLink}">Rate this article</a></p>

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
