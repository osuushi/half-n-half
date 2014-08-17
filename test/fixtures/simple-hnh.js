function foo () {
  $: a = someMethod();
  $$$;
  return a;
}
