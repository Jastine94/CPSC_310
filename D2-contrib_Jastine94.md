D2 Autotest Pass: 97.1 % 34/35 (77.68/80)
Test Coverage: 96.1% + 5% for (20/20)
Total: 97.68/100

I add support for the new course_uuid. I implemented the new EBNF queries for deliverable 2. I added implemention to support grouping, new ordering and
apply(min, max, avg, count). I added some tests to make sure the codes are working as expected and some integration tests
to make sure that the previous functionality are still supported. I did some minor refactoring too.

Github commits are:
22934347f5ab517aef69565abaa02896dcde6f2b added support for course_uuid plus refactor.

403b6d8c289ed81f498bb54225260c2ab97d57b3 group implementation plus test.

020dd7ff360733775bbe26f7c2b5808c877f16de new order implementation.

27658439ff0c959d1b7cc5a59e38ada2f5a2ded2 test for order.

0204becb218a9b62020364bd704a77fb2ae41195 fixed a bug that occurs when where is empty.

0204becb218a9b62020364bd704a77fb2ae41195 apply implementation

6cc9ddb0e512fbf7b4441f6b7759148aa57ad2c3 tests for apply
93ddbef78a9b0ca277e032a75afaf9a6aab1505f

cb88291ee3c43eb6a8705bd5f273443d83d5f368 bug fixed found from running the private suite.
0811106af42a0110785c5b5261aca87beddfd6f0
951c8da91f667b7455d2b7d7d100e407eb03e8c2
4e80f874f833859f922dcda192d1eacd83aba9d1

ae0be215b2b9cabbb97d9f230858bdd241da8afe clean up

There are other minor commits but they are mostly clean up, refactoring and private suite testing.