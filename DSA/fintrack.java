
import java.util.*;

public class fintrack {

    // ── Transaction Model ────────────────────────────────────────────────────
    record Transaction(int id, String name, String type, String category, double amount, String date) {

        public String toString() {
            return String.format("[#%d] %-22s | %-7s | %-15s | ₹%8.2f | %s", id, name, type, category, amount, date);
        }
    }

    // ── Sample Data ──────────────────────────────────────────────────────────
    static ArrayList<Transaction> txns = new ArrayList<>(Arrays.asList(
            new Transaction(1, "Monthly Salary", "income", "Salary", 55000, "2026-02-01"),
            new Transaction(2, "Freelance Payment", "income", "Freelance", 12000, "2026-02-05"),
            new Transaction(3, "Rent Payment", "expense", "Housing", 18000, "2026-02-03"),
            new Transaction(4, "Grocery Shopping", "expense", "Food & Dining", 3200, "2026-02-07"),
            new Transaction(5, "Netflix", "expense", "Entertainment", 649, "2026-02-08"),
            new Transaction(6, "Electricity Bill", "expense", "Utilities", 2100, "2026-02-10"),
            new Transaction(7, "Metro Card", "expense", "Transportation", 1500, "2026-02-11"),
            new Transaction(8, "Online Shopping", "expense", "Shopping", 4500, "2026-02-14"),
            new Transaction(9, "Restaurant Dinner", "expense", "Food & Dining", 1800, "2026-02-16"),
            new Transaction(10, "Bonus", "income", "Salary", 8000, "2026-02-20")
    ));

    // ── CO-2: Singly Linked List - transaction history ────────────────────────
    static class Node {

        Transaction data;
        Node next;

        Node(Transaction d) {
            data = d;
            next = null;
        }
    }

    static class SinglyLinkedList {

        Node head;

        void add(Transaction t) {
            Node n = new Node(t);
            if (head == null) {
                head = n;
                return;
            }
            Node cur = head;
            while (cur.next != null) {
                cur = cur.next;
            }
            cur.next = n;
        }

        void print() {
            Node cur = head;
            int idx = 1;
            while (cur != null) {
                System.out.println("  Node " + idx++ + " → " + cur.data);
                cur = cur.next;
            }
        }
    }

    // ── CO-3: Stack - Undo deleted transaction ────────────────────────────────
    static Stack<Transaction> undoStack = new Stack<>();

    static void delete(int id) {
        txns.stream().filter(t -> t.id() == id).findFirst().ifPresent(t -> {
            undoStack.push(t);
            txns.remove(t);
            System.out.println("  Deleted : " + t);
        });
    }

    static void undo() {
        if (!undoStack.isEmpty()) {
            Transaction t = undoStack.pop();
            txns.add(t);
            System.out.println("  Restored: " + t);
        } else {
            System.out.println("  Nothing to undo.");
        }
    }

    // ── CO-3: Queue - Budget alert notifications ──────────────────────────────
    static void processAlerts() {
        Queue<String> q = new LinkedList<>(Arrays.asList(
                " OVER BUDGET : Shopping - ₹6800 spent of ₹5000 limit",
                " WARNING      : Entertainment - 92% of budget used",
                " WARNING      : Transportation - 87% of budget used"
        ));
        System.out.println("  " + q.size() + " alerts queued (FIFO):");
        while (!q.isEmpty()) {
            System.out.println("  → " + q.poll());
        }
    }

    // ── CO-1: Linear Search - by category ────────────────────────────────────
    static void linearSearch(String cat) {
        System.out.println("  Searching for: \"" + cat + "\"");
        txns.stream().filter(t -> t.category().equalsIgnoreCase(cat)).forEach(t -> System.out.println("  " + t));
    }

    // ── CO-1: Binary Search - by amount ──────────────────────────────────────
    static int binarySearch(ArrayList<Transaction> sorted, double target) {
        int lo = 0, hi = sorted.size() - 1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            double m = sorted.get(mid).amount();
            if (m == target) {
                return mid;
            } else if (m < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return -1;
    }

    // ── CO-1: Bubble Sort - by date ascending ────────────────────────────────
    static ArrayList<Transaction> bubbleSort(ArrayList<Transaction> list) {
        ArrayList<Transaction> a = new ArrayList<>(list);
        for (int i = 0; i < a.size() - 1; i++) {
            for (int j = 0; j < a.size() - i - 1; j++) {
                if (a.get(j).date().compareTo(a.get(j + 1).date()) > 0) {
                    Transaction t = a.get(j);
                    a.set(j, a.get(j + 1));
                    a.set(j + 1, t);
                }
            }
        }
        return a;
    }

    // ── CO-1: Merge Sort - by amount descending ───────────────────────────────
    static ArrayList<Transaction> mergeSort(ArrayList<Transaction> l) {
        if (l.size() <= 1) {
            return l;
        }
        int m = l.size() / 2;
        ArrayList<Transaction> L = mergeSort(new ArrayList<>(l.subList(0, m)));
        ArrayList<Transaction> R = mergeSort(new ArrayList<>(l.subList(m, l.size())));
        ArrayList<Transaction> res = new ArrayList<>();
        int i = 0, j = 0;
        while (i < L.size() && j < R.size()) {
            if (L.get(i).amount() >= R.get(j).amount()) {
                res.add(L.get(i++));
            } else {
                res.add(R.get(j++));
            }
        }
        while (i < L.size()) {
            res.add(L.get(i++));
        }
        while (j < R.size()) {
            res.add(R.get(j++));
        }
        return res;
    }

    // ── CO-4: HashMap - spending by category ─────────────────────────────────
    static void categoryHashMap() {
        Map<String, Double> map = new HashMap<>();
        txns.stream().filter(t -> t.type().equals("expense")).forEach(t -> map.merge(t.category(), t.amount(), Double::sum));
        System.out.println("  Category-wise spending (HashMap):");
        map.forEach((cat, total) -> System.out.printf("  %-20s ₹%.2f%n", cat, total));
    }

    static void sep(String title) {
        System.out.println("\n" + "─".repeat(60) + "\n  " + title + "\n" + "─".repeat(60));
    }

    static void showMenu() {
        System.out.println("\n╔══════════════════════════════════════════════════╗");
        System.out.println("║     FinTrack - DSA Concepts Demonstration        ║");
        System.out.println("╠══════════════════════════════════════════════════╣");
        System.out.println("║  CO-1 Searching & Sorting                        ║");
        System.out.println("║   1. Linear Search - Find by category            ║");
        System.out.println("║   2. Binary Search - Find by amount              ║");
        System.out.println("║   3. Bubble Sort   - Sort by date                ║");
        System.out.println("║   4. Merge Sort    - Sort by amount              ║");
        System.out.println("║  CO-2 Lists                                      ║");
        System.out.println("║   5. ArrayList          - All transactions       ║");
        System.out.println("║   6. Singly Linked List - Transaction history    ║");
        System.out.println("║  CO-3 Stacks & Queues                            ║");
        System.out.println("║   7. Stack - Undo deleted transaction            ║");
        System.out.println("║   8. Queue - Process budget alerts               ║");
        System.out.println("║  CO-4 Hashing                                    ║");
        System.out.println("║   9. HashMap - Spending by category              ║");
        System.out.println("║  10. Summary - Financial overview                ║");
        System.out.println("║   0. Exit                                        ║");
        System.out.println("╚══════════════════════════════════════════════════╝");
        System.out.print("  Select an option: ");
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ArrayList<Transaction> sorted = new ArrayList<>(txns);
        sorted.sort(Comparator.comparingDouble(Transaction::amount));

        int choice = -1;
        while (choice != 0) {
            showMenu();
            try {
                choice = Integer.parseInt(sc.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("  Invalid input. Please enter a number.");
                continue;
            }
            switch (choice) {
                case 1 -> {
                    sep("1. LINEAR SEARCH [CO-1] - Transactions in 'Food & Dining'");
                    linearSearch("Food & Dining");
                }
                case 2 -> {
                    sep("2. BINARY SEARCH [CO-1] - Find transaction with amount ₹2100");
                    int idx = binarySearch(sorted, 2100);
                    System.out.println(idx != -1 ? "  ✓ Found at index " + idx + ": " + sorted.get(idx) : "  ✗ Not found.");
                }
                case 3 -> {
                    sep("3. BUBBLE SORT [CO-1] - By date ascending");
                    bubbleSort(txns).forEach(t -> System.out.println("  " + t));
                }
                case 4 -> {
                    sep("4. MERGE SORT [CO-1] - By amount descending");
                    mergeSort(new ArrayList<>(txns)).forEach(t -> System.out.println("  " + t));
                }
                case 5 -> {
                    sep("5. ARRAYLIST [CO-2] - " + txns.size() + " transactions loaded");
                    txns.forEach(t -> System.out.println("  " + t));
                }
                case 6 -> {
                    sep("6. SINGLY LINKED LIST [CO-2] - Transaction history");
                    SinglyLinkedList list = new SinglyLinkedList();
                    txns.forEach(list::add);
                    list.print();
                }
                case 7 -> {
                    sep("7. STACK [CO-3] - Undo deleted transaction");
                    delete(5);
                    delete(8);
                    System.out.println("  Stack top: " + (undoStack.isEmpty() ? "empty" : undoStack.peek()));
                    undo();
                    undo();
                    undo();
                }
                case 8 -> {
                    sep("8. QUEUE [CO-3] - Budget alert notifications");
                    processAlerts();
                }
                case 9 -> {
                    sep("9. HASHMAP [CO-4] - Spending by category");
                    categoryHashMap();
                }
                case 10 -> {
                    sep("SUMMARY - Financial Overview");
                    double income = txns.stream().filter(t -> t.type().equals("income")).mapToDouble(Transaction::amount).sum();
                    double expense = txns.stream().filter(t -> t.type().equals("expense")).mapToDouble(Transaction::amount).sum();
                    System.out.printf("  Income  : ₹%.0f%n", income);
                    System.out.printf("  Expenses: ₹%.0f%n", expense);
                    System.out.printf("  Balance : ₹%.0f%n", income - expense);
                    System.out.printf("  Savings : %.1f%%%n", ((income - expense) / income) * 100);
                }
                case 0 ->
                    System.out.println("\n  Exiting FinTrack DSA Demo. Goodbye!");
                default ->
                    System.out.println("  Invalid option. Please choose between 0 and 10.");
            }
        }
        sc.close();
    }
}
