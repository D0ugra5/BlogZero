import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.content}>
      <div className={styles.container}>
        <Link href='/'>
          <a>
            <Image width={250} height={120} src='/images/logo.svg' alt='logo' />
          </a>
        </Link>

      </div>
    </header>
  );
}
