import Image from 'next/image';

export default function Logo({ size = 32, className = '' }) {
  return (
    <Image
      src="/icon.svg"
      alt="Velloura Collective Logo"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}