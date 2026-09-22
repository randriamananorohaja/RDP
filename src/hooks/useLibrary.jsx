import { useState, useCallback } from 'react';

const initialBooks = [
  { id: 1, title: 'Les Misérables', author: 'Victor Hugo', isbn: '978-2-07-041309-4', available: true },
  { id: 2, title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', isbn: '978-2-07-040850-2', available: true },
  { id: 3, title: '1984', author: 'George Orwell', isbn: '978-0-452-28423-4', available: true },
  { id: 4, title: 'L\'Étranger', author: 'Albert Camus', isbn: '978-2-07-041942-3', available: true },
  { id: 5, title: 'Madame Bovary', author: 'Gustave Flaubert', isbn: '978-2-07-041956-0', available: true },
];

const initialBorrowers = [
  { id: 1, name: 'Jean Dupont', email: 'jean.dupont@email.com' },
  { id: 2, name: 'Marie Martin', email: 'marie.martin@email.com' },
  { id: 3, name: 'Pierre Bernard', email: 'pierre.bernard@email.com' },
];

export const useLibrary = () => {
  const [books, setBooks] = useState(initialBooks);
  const [borrowers, setBorrowers] = useState(initialBorrowers);
  const [loans, setLoans] = useState([]);

  const addBook = useCallback((book) => {
    setBooks([...books, { ...book, id: Date.now(), available: true }]);
  }, [books]);

  const removeBook = useCallback((bookId) => {
    setBooks(books.filter(book => book.id !== bookId));
  }, [books]);

  const borrowBook = useCallback((bookId, borrowerId) => {
    const book = books.find(b => b.id === bookId);
    if (!book || !book.available) return false;

    setBooks(books.map(b => b.id === bookId ? { ...b, available: false } : b));
    setLoans([...loans, {
      id: Date.now(),
      bookId,
      borrowerId,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      returned: false,
    }]);
    return true;
  }, [books, loans]);

  const returnBook = useCallback((loanId) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return false;

    setBooks(books.map(b => b.id === loan.bookId ? { ...b, available: true } : b));
    setLoans(loans.map(l => l.id === loanId ? { ...l, returned: true, returnDate: new Date() } : l));
    return true;
  }, [books, loans]);

  const addBorrower = useCallback((borrower) => {
    setBorrowers([...borrowers, { ...borrower, id: Date.now() }]);
  }, [borrowers]);

  const getAvailableBooks = useCallback(() => {
    return books.filter(book => book.available);
  }, [books]);

  const getActiveLoans = useCallback(() => {
    return loans.filter(loan => !loan.returned);
  }, [loans]);

  return {
    books,
    borrowers,
    loans,
    addBook,
    removeBook,
    borrowBook,
    returnBook,
    addBorrower,
    getAvailableBooks,
    getActiveLoans,
  };
};
