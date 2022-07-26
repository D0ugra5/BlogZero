import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {

  first_publication_date: string | null;

  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  function countWords() {
    let countBodyText;
    let acummulatorText;
    const t = post.data.content.reduce((acc, curr) => {
      countBodyText = curr.body.map(item => {
        if (item.text && item.text != ' ') {
          acummulatorText = item.text.split(' ').reduce((acc, curr) => {
            return acc + curr.length;
          }, 0);
          return acummulatorText
        }
        return 0;
      });
      return acc + countBodyText.reduce((acc, curr) => {
        return acc + curr;
      });
    }, 0);

    const results = Math.ceil(t / 200);
    return results;

  }
  countWords();
  return (
    <>
      <div className={styles.container}>
        <div className={styles.imageBox}>
          <img src={post.data.banner.url} alt={post.data.title} />
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.author}>
            <FiCalendar />
            <time>{post.first_publication_date}</time>
            <FiUser />
            <p>{post.data.author}</p>
            <FiClock />
            <span>4 min</span>

          </div>
          <div className={styles.containerHtml}>
            {post.data.content.map((content) => (
              <>
                <h1>{content.heading}</h1>
                {content.body.map((body) => (
                  <div key={body.text} className={styles.postContent} dangerouslySetInnerHTML={{ __html: body.text }} />
                ))}
              </>
            ))}

          </div>
        </div>
      </div>
      <span>Carregando...</span>
    </>
  )
}
interface pathProps {
  slug: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('blogzero');
  console.log(posts);
  const pathPosts = posts.results.map((post) => { return post.uid });

  return {
    paths: [{ params: { slug: pathPosts[0] } }, { params: { slug: pathPosts[1] } }],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params as any;
  console.log(slug);
  const post = await prismic.getByUID('blogzero', slug);
  post.first_publication_date = format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR });
  post.data.content.map(content => {
    return {
      heading: content.heading,
      body: RichText.asHtml(content.body)
    }
  })

  return {
    props: {
      post

    }
  }
}
