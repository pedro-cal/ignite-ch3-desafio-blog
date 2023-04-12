import Link from 'next/dist/client/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <Link href="/">
      <div className={styles.imgBox}>
        <img src="/logo.svg" alt="logo" />
      </div>
    </Link>
  );
}
