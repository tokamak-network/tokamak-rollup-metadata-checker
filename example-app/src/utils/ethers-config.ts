// JsonRpcProvider 에러 로그 억제
export function configureEthersLogging() {
  // console.error를 일시적으로 오버라이드하여 JsonRpcProvider 에러만 필터링
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');

    // JsonRpcProvider 관련 에러 메시지 필터링 (더 강력하게)
    if (message.includes('JsonRpcProvider failed to detect network') ||
        message.includes('retry in 1s') ||
        message.includes('perhaps the URL is wrong or the node is not started') ||
        message.includes('JsonRpcProvider') ||
        message.includes('failed to detect network') ||
        message.includes('cannot start up')) {
      return; // 이 에러들은 출력하지 않음
    }

    // 다른 에러들은 정상적으로 출력
    originalConsoleError.apply(console, args);
  };

  // console.warn도 필터링
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args.join(' ');

    if (message.includes('JsonRpcProvider') ||
        message.includes('retry in 1s') ||
        message.includes('failed to detect network') ||
        message.includes('cannot start up')) {
      return;
    }

    originalConsoleWarn.apply(console, args);
  };

  // console.log도 필터링 (혹시 모르니)
  const originalConsoleLog = console.log;
  console.log = (...args: any[]) => {
    const message = args.join(' ');

    if (message.includes('JsonRpcProvider failed to detect network') ||
        message.includes('retry in 1s') ||
        message.includes('cannot start up')) {
      return;
    }

    originalConsoleLog.apply(console, args);
  };
}

// 애플리케이션 시작 시 호출
configureEthersLogging();
