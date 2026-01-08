import { useEffect } from 'react';

export default function MemberInfoRedirect() {
  useEffect(() => {
    window.location.href = '/web3/landing';
  }, []);

  return null;
}
