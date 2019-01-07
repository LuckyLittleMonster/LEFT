CPPFLAGS= -Wall -Wextra -pedantic -std=c++11
CXX = g++

TESTFILES = $(wildcard *.cc)
NAMES = $(patsubst %.cc, %, $(TESTFILES))


all: $(NAMES)
	# Insert command to compile the code and generate executable

run: all
	# Insert command to run the executable
	@for obj in $(NAMES); do \
		./$$obj; \
	done
checkmem: all
	# Insert command to run the executable with valgrind
	@for obj in $(NAMES); do \
		valgrind ./$$obj; \
	done
clean:
	# Insert command to clean object files, executables
	-rm $(NAMES)
test-scaling: Map.hpp test-scaling.cpp
	g++ test-scaling.cpp -o test-scaling $(CPPFLAGS) -O
nouse:
	# @for name in $(NAMES); do \
	# 	$(CXX) $$name.cpp -o $$name.out \
	# 	$(CPPFLAGS) $(STD); \
	# done
