import Mainvisual from '../components/mainvisual/mainvisual';
import NewBooks from '../components/newBooks/newBooks';
import Rank from '../components/rank/rank';
import History from '../components/history/history';
import BookMarks from '../components/bookMarks/bookMarks';

export default function Home() {
  return (
    <>
      <Mainvisual></Mainvisual>
      <NewBooks></NewBooks>
      <Rank></Rank>
      <History></History>
      <BookMarks></BookMarks>
    </>
  );
}
