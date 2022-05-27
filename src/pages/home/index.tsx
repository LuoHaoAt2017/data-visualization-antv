import moment from 'moment';
import styles from './index.less';

export default function IndexPage() {
  console.log(moment('09:23', 'HH:mm').isBefore(moment('09:34', 'HH:mm')));
  console.log('09:23 ', moment('09:23', 'HH:mm').hours());
  console.log('09:23 ', moment('09:23', 'HH:mm').minutes() / 60);
  return (
    <div>
      <h1 className={styles.title}>Page index</h1>
    </div>
  );
}
