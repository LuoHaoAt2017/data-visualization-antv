window.onload = async function() {
  try {
   await new Promise(function(resolve) {
     console.log('a');
      setTimeout(function() {
        console.log('b');
        resolve();
      }, 500);
    });
  } catch {
    console.error('error');
  } finally {
    console.log('c');
  }
}