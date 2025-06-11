import React from 'react';
import {PageHOC} from '../components';

const CreateBattle = () => {
  return (
    <div class="text-sky-50">
      Hello From Create Battle
    </div>
  )
};

export default PageHOC(
  CreateBattle,
  (<>Create <br /> a new Battle </>),
  (<>Create your own Battle and wait for others to join you</>)
);