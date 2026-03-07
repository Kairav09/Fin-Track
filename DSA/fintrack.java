
import java.util.*;

public class fintrack {

    // ── Transaction Model ────────────────────────────────────────────────────
    record Transaction(int id, String name, String type, String category, double amount, String date) {

        @Override
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

    // ── Stack: Undo deleted transaction ──────────────────────────────────────
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

    // ── Queue: Budget alert notifications ────────────────────────────────────
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

    // ── Linear Search: by category ───────────────────────────────────────────
    static void linearSearch(String cat) {
        System.out.println("  Searching for: \"" + cat + "\"");
        txns.stream().filter(t -> t.category().equalsIgnoreCase(cat)).forEach(t -> System.out.println("  " + t));
    }

    // ── Binary Search: by amount (on sorted list) ────────────────────────────
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

    // ── Bubble Sort: by date ascending ───────────────────────────────────────
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

    // ── Merge Sort: by amount descending ─────────────────────────────────────
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

    static void sep(String title) {
        System.out.println("\n" + "─".repeat(60) + "\n  " + title + "\n" + "─".repeat(60));
    }

    static void showMenu() {
        System.out.println("======== FinTrack - DSA Concepts Demonstration ========");
        System.out.println("1. ArrayList - View all transactions");
        System.out.println("2. Stack - Undo deleted transaction");
        System.out.println("3. Queue - Process budget alerts");
        System.out.println("4. Linear Search - Find by category");
        System.out.println("5. Binary Search - Find by amount");
        System.out.println("6. Bubble Sort - Sort by date");
        System.out.println("7. Merge Sort - Sort by amount");
        System.out.println("8. Summary - Financial overview");
        System.out.println("0. Exit");
        System.out.println("========================================================");
        System.out.print("Select an option: ");
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
                    sep("1. ARRAYLIST - " + txns.size() + " transactions loaded");
                    txns.forEach(t -> System.out.println("  " + t));
                }
                case 2 -> {
                    sep("2. STACK - Undo deleted transaction");
                    delete(5);
                    delete(8);
                    System.out.println("  Stack top: " + (undoStack.isEmpty() ? "empty" : undoStack.peek()));
                    undo();
                    undo();
                    undo();
                }
                case 3 -> {
                    sep("3. QUEUE - Budget alert notifications");
                    processAlerts();
                }
                case 4 -> {
                    sep("4. LINEAR SEARCH - Transactions in 'Food & Dining'");
                    linearSearch("Food & Dining");
                }
                case 5 -> {
                    sep("5. BINARY SEARCH - Find transaction with amount ₹2100");
                    int idx = binarySearch(sorted, 2100);
                    System.out.println(idx != -1 ? "  ✓ Found at index " + idx + ": " + sorted.get(idx) : "  ✗ Not found.");
                }
                case 6 -> {
                    sep("6. BUBBLE SORT - By date ascending");
                    bubbleSort(txns).forEach(t -> System.out.println("  " + t));
                }
                case 7 -> {
                    sep("7. MERGE SORT - By amount descending (Top Expenses)");
                    mergeSort(new ArrayList<>(txns)).forEach(t -> System.out.println("  " + t));
                }
                case 8 -> {
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
                    System.out.println("  Invalid option. Please choose between 0 and 8.");
            }
        }
    }
}
