import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | number | Date;
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

export default function Home({ postsPagination }: HomeProps): unknown {
  const { results, next_page } = postsPagination;

  const [displayResults, setDisplayResults] = useState(results);

  function loadMorePosts(): void {
    fetch(next_page)
      .then(res => res.json())
      .then(data => {
        const newResults = data.results;
        setDisplayResults([...results, ...newResults]);
      });
  }

  return (
    <>
      <Head>
        <title>spacetravelling | Home</title>
      </Head>

      <main className={commonStyles.mainBox}>
        <div className={commonStyles.contentBox}>
          <Header />
          <div className={styles.postsBox}>
            {displayResults
              ? displayResults.map((post: Post) => (
                  <Link href={`/post/${post.uid}`} key={post.uid} passHref>
                    <div key={post.uid}>
                      <h1>{post.data.title}</h1>
                      <h2>{post.data.subtitle}</h2>
                      <div>
                        <div>
                          <FiCalendar />
                          <time>
                            {format(
                              new Date(post.first_publication_date),
                              'dd MMM yyyy',
                              { locale: ptBR }
                            )}
                          </time>
                        </div>
                        <div>
                          <FiUser />
                          <p>{post.data.author}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              : null}
            {next_page ? (
              <button type="button" onClick={() => loadMorePosts()}>
                Carregar mais posts
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 1 });
  const { next_page, results } = postsResponse;
  const formattedPosts = results.map(each => ({
    uid: each.uid,
    first_publication_date: each.first_publication_date,
    data: {
      title: each.data.title,
      subtitle: each.data.subtitle,
      author: each.data.author,
    },
  }));

  return {
    props: {
      postsResponse,
      posts: postsResponse.results,
      postsPagination: {
        next_page,
        results: formattedPosts,
      },
    },
    revalidate: 60 * 60 * 60,
  };
};
