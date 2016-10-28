D2 Autotest Pass: 97.1 % 34/35 (77.68/80)
Test Coverage: 96.1% + 5% for (20/20)
Total: 97.68/100

I add support for the new course_uuid. I implemented the new EBNF queries for deliverable 2. I added implemention to support grouping, new ordering and
apply(min, max, avg, count). I added some tests to make sure the codes are working as expected and some integration tests
to make sure that the previous functionality are still supported. I did some minor refactoring too.

Github commits are:
https://github.com/CS310-2016Fall/cpsc310project_team17/commit/22934347f5ab517aef69565abaa02896dcde6f2b added support for course_uuid plus refactor.

https://github.com/CS310-2016Fall/cpsc310project_team17/commit/403b6d8c289ed81f498bb54225260c2ab97d57b3 group implementation plus test.

https://github.com/CS310-2016Fall/cpsc310project_team17/commit/020dd7ff360733775bbe26f7c2b5808c877f16de new order implementation.

https://github.com/CS310-2016Fall/cpsc310project_team17/commit/27658439ff0c959d1b7cc5a59e38ada2f5a2ded2 test for order.

https://github.com/CS310-2016Fall/cpsc310project_team17/commit/0204becb218a9b62020364bd704a77fb2ae41195 fixed a bug that occurs when where is empty.

https://github.com/CS310-2016Fall/cpsc310project_team17/commit/a570e533248d39b304d2838b5cd58df281af051c apply implementation

https://github.com/CS310-2016Fall/cpsc310project_team17/commit/6cc9ddb0e512fbf7b4441f6b7759148aa57ad2c3 tests for apply
https://github.com/CS310-2016Fall/cpsc310project_team17/commit/93ddbef78a9b0ca277e032a75afaf9a6aab1505f

https://github.com/CS310-2016Fall/cpsc310project_team17/commit/cb88291ee3c43eb6a8705bd5f273443d83d5f368 bug fixed found from running the private suite.
https://github.com/CS310-2016Fall/cpsc310project_team17/commit/0811106af42a0110785c5b5261aca87beddfd6f0
https://github.com/CS310-2016Fall/cpsc310project_team17/commit/951c8da91f667b7455d2b7d7d100e407eb03e8c2
https://github.com/CS310-2016Fall/cpsc310project_team17/commit/4e80f874f833859f922dcda192d1eacd83aba9d1

https://github.com/CS310-2016Fall/cpsc310project_team17/commit/ae0be215b2b9cabbb97d9f230858bdd241da8afe clean up

There are other minor commits but they are mostly clean up, refactoring and private suite testing.