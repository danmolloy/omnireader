import { setupDatabase } from '#/helpers';
import { scrape } from '/services/scraper';
import { refreshStory } from '/services/refresher';
import { generateStory } from '#/factories/story';
import { generatePost } from '#/factories/post';
import { Story } from '/models/story';
import { Post } from '/models/post';

setupDatabase();

jest.mock('./scraper');

const story = generateStory();
const post1 = generatePost();
const post2 = generatePost();
const newPost = generatePost();

const setupSavedStory = async () => {
  const savedStory = await Story.query().insert(story);
  await savedStory.$relatedQuery('posts').insert([post1, post2]);
  return savedStory;
};

describe('.refreshStory', () => {
  it('fetches the story', async () => {
    const savedStory = await setupSavedStory();
    scrape.mockImplementationOnce(() => {
      return { ...story, posts: [post1, post2] };
    });
    refreshStory(savedStory);
    expect(scrape).toHaveBeenCalledWith({
      url: story.canonicalUrl,
      getStory: true,
    });
  });

  context('when there are no new posts', () => {
    it('does nothing', async () => {
      const savedStory = await setupSavedStory();

      scrape.mockImplementationOnce(() => {
        return { ...story, posts: [post1, post2] };
      });
      refreshStory(savedStory);
      const postCount = await Post.query().count();
      expect(postCount[0].count).toStrictEqual('2');
    });
  });

  context('when there are new posts', () => {
    it('adds new post to the database', async () => {
      const savedStory = await setupSavedStory();
      scrape.mockImplementationOnce(() => {
        return { ...story, posts: [post1, post2, newPost] };
      });
      refreshStory(savedStory);
      const [{ posts }] = await Story.query().eager('posts');
      expect(posts).toHaveLength(3);
      expect(posts[2].title).toStrictEqual(newPost.title);
    });

    it('touches the story', async () => {
      const savedStory = await setupSavedStory();
      scrape.mockImplementationOnce(() => {
        return { ...story, posts: [post1, post2, newPost] };
      });
      refreshStory(savedStory);
      const times = await Story.query().select('updated_at');
      const storyUpdated = times[0].updated_at;

      expect(storyUpdated.getTime()).toBeGreaterThan(new Date() - 1000); // 1 second ago
    });
  });
});
