
import java.util.*;

public class JavaTest {
    public static <T> void main(String[] args) {
        
        ArrayList<T> list = new ArrayList<>();
        LinkedList<T> linkedList = new LinkedList<>();
        Vector<T> vector = new Vector<>();
        Stack<T> stack = new Stack<>();

        List<T> list1 = new ArrayList<>();
        List<T> list2 = new LinkedList<>();
        List<T> list3 = new Vector<>();
        List<T> list4 = new Stack<>();

        Vector<T> vector1 = new Stack<>();
        
        ArrayDeque<Integer> arraydeque = new ArrayDeque<>();
        PriorityQueue<T> priorityqueue = new PriorityQueue<>();
        
        Deque<T> arraydeque1 = new ArrayDeque<>();
        Deque<T> linkedlistdeque1 = new LinkedList<>();
        
        Queue<T> arraydeque2 = new ArrayDeque<>();
        Queue<T> linkedlistdeque2 = new LinkedList<>();
        Queue<T> priorityqueue2 = new PriorityQueue<>();

        // Deque<Integer> stack2 = new ArrayDeque<>();

        // stack2.push(1);

        // System.out.println(stack2.pop());
        // System.out.println(stack2.peekFirst());

        // PriorityQueue<Integer> pq = new PriorityQueue<>();
        // pq.offer(3);
        // pq.offer(1);
        // pq.offer(2);

        // System.out.println(pq.poll()); // 1
        // System.out.println(pq.poll()); // 2
        // System.out.println(pq.poll()); // 3


        HashSet<Integer> hashset = new HashSet<>();
        LinkedHashSet<T> linkedhashset = new LinkedHashSet<>();
        TreeSet<T> treeset = new TreeSet<>();

        SortedSet<T> sortedset1 = new TreeSet<>();

        Set<T> hashset1 = new HashSet<>();
        Set<T> linkedhashset1 = new LinkedHashSet<>();
        Set<T> treeset1 = new TreeSet<>();

        hashset.add(2);
        hashset.add(1);
        hashset.add(1);
        hashset.add(3);

        System.out.println(hashset.contains(1)); // true
        System.out.println(hashset.size()); // 3
        System.out.println(hashset); // [1, 2, 3]
    }

}
