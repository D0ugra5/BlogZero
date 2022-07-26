import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';

import { FiUser, FiCalendar } from 'react-icons/fi';
import styles from './home.module.scss';
import Link from 'next/link';
import { url } from 'inspector';
import { HttpRequestLike } from '@prismicio/client';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  function handleLoadMore() {
    const url = postsPagination.next_page;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        postsPagination.next_page = data.next_page;
        setPosts([...posts, ...data.results]);
      })
  }

  function formatDate(date: string) {

    return format(new Date(date), 'dd MMM yyyy', { locale: ptBR });
  }
  return (
    <main className={styles.container}>
      {posts.map((post) => (
        <Link key={post.uid} href={`/post/${post.uid}`} >
          <div key={post.uid} className={styles.content}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div className={styles.infoPost}>
                <FiCalendar />
                <time>{formatDate(post.first_publication_date)}</time>
                <FiUser />
                <p>{post.data.author}</p>
              </div>
            </a>
          </div>

        </Link>
      ))
      }
      {postsPagination.next_page && (
        <div className={styles.carregar}>
          <a onClick={() => handleLoadMore()}>Carregar mais posts</a>
        </div>
      )}

    </main >

  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({ req: { query: { graphQLFetch: `[at(my.blogzero.title, "Elixir na pratica")]` } } });
  const postsResponse = await (await prismic.getByType('blogzero', { pageSize: 1 }));

  let nextPage: string;
  const posts = postsResponse.results.map(dados => {
    nextPage = postsResponse.next_page;
    return {
      uid: dados.uid,
      data: {
        title: dados.data.title,
        subtitle: dados.data.subtitle,
        author: dados.data.author,
      },
      first_publication_date: dados.first_publication_date,
    }


  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: nextPage,
      }
    },
  }
};
