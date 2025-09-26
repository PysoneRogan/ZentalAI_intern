import React, { useState } from 'react';
import Button from './Button';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked <Button styleType="danger">{count}</Button>  times</p>
      <Button styleType="success" onClick={() => setCount(prevCount => prevCount + 1)}>
        Increment
      </Button>
      <Button onClick={() => setCount(prevCount => prevCount - 1)}>
        Decrement
      </Button>
    </div>
  );
}

export default Counter;
