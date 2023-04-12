import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Content {
  heading: string;
  body: {
    text: string;
  }[];
}

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: Content[];
  };
}

interface PostProps {
  post: Post;
}

function estimateReadingTime(contentArray: Content[]): number {
  const speed = 200;
  let headingWords = 0;
  let bodyWords = 0;

  contentArray.forEach((cont: Content) => {
    headingWords =
      cont && cont.heading
        ? cont.heading.split(' ').length + headingWords
        : headingWords;

    const bodyText =
      cont && cont.body && !!cont.body.length ? RichText.asText(cont.body) : '';

    bodyWords = bodyText.split(' ').length + bodyWords;
  });

  return Math.ceil((headingWords + bodyWords) / speed);
}

function formatPost(postData: any): Post {
  const formattedPost: Post = {
    first_publication_date: format(
      new Date(postData.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    ),
    data: {
      title: postData.data.title,
      subtitle: postData.data.subtitle,
      banner: { url: postData.data.banner.url },
      author: postData.data.author,
      content: postData.data.content.map((cont: any) => {
        return {
          heading: cont.heading,
          body: [...cont.body],
        };
      }),
    },
  };

  return formattedPost;
}

export default function Post({ post }: PostProps): JSX.Element | null {
  const router = useRouter();
  const [formattedPost, setFormattedPost] = useState<Post>({
    first_publication_date: '',
    data: {
      title: '',
      subtitle: '',
      banner: {
        url: '',
      },
      author: '',
      content: [],
    },
  });

  useEffect(() => {
    setFormattedPost(formatPost(post));
  }, [post]);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <main className={commonStyles.mainBox}>
      <div className={commonStyles.contentBox}>
        <Header />
      </div>
      <div className={styles.banner}>
        <img
          src={formattedPost?.data.banner.url}
          alt={formattedPost?.data.title}
        />
      </div>
      <div className={commonStyles.contentBox}>
        <div className={styles.postBox}>
          <h1>{formattedPost?.data.title}</h1>
          <div className={styles.postInfoBox}>
            <span>
              <FiCalendar />
              {formattedPost?.first_publication_date}
            </span>
            <span>
              <FiUser />
              {formattedPost?.data.author}
            </span>
            <span>
              <FiClock />
              {`${estimateReadingTime(formattedPost.data.content)} min`}
            </span>
          </div>
          <div className={styles.postContent}>
            {formattedPost.data.content
              ? formattedPost.data.content.map(cont => {
                  return (
                    <div key={cont.heading}>
                      <h2>{cont.heading}</h2>
                      <p>{RichText.asText(cont.body)}</p>
                    </div>
                  );
                })
              : null}
          </div>
        </div>
      </div>
      <div>Carregando...</div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getAllByType('posts');

  return {
    paths: posts.map(p => {
      return {
        params: {
          slug: String(p.uid),
        },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }: any) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      // post,
      post: response,
    },
    revalidate: 3600,
  };
};
