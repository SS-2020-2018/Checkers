from board import Board
from copy import deepcopy
from random import choice

class AI:
	def __init__(self, color):
		self.color = color

	def _legal_moves(self, board, color):
		moves = []
		for index, piece in enumerate(board.get_pieces()):
			if piece.get_color() != color:
				continue
			for move in piece.get_moves(board):
				moves.append({"piece": index, "move": move})

		jump_moves = [move for move in moves if move["move"]["eats_piece"]]
		return jump_moves if jump_moves else moves

	def _next_board(self, board, move):
		new_board = Board(deepcopy(board.get_pieces()), board.get_color_up())
		new_board.move_piece(move["piece"], int(move["move"]["position"]))
		return new_board

	def minimax(self, current_board, is_maximizing, depth, turn, alpha=-999, beta=999):
		if depth == 0 or current_board.get_winner() is not None:
			return self.get_value(current_board)

		moves = self._legal_moves(current_board, turn)
		if not moves:
			return self.get_value(current_board)

		next_turn = "B" if turn == "W" else "W"
		if is_maximizing:
			best_value = -999
			for move in moves:
				value = self.minimax(self._next_board(current_board, move), False, depth - 1, next_turn, alpha, beta)
				best_value = max(best_value, value)
				alpha = max(alpha, best_value)
				if beta <= alpha:
					break
			return best_value

		best_value = 999
		for move in moves:
			value = self.minimax(self._next_board(current_board, move), True, depth - 1, next_turn, alpha, beta)
			best_value = min(best_value, value)
			beta = min(beta, best_value)
			if beta <= alpha:
				break
		return best_value

	def monte_carlo_score(self, board, turn, simulations=4, rollout_depth=5):
		"""Estimate a tied move with short random playouts from the position."""
		score = 0
		for _ in range(simulations):
			rollout_board = Board(deepcopy(board.get_pieces()), board.get_color_up())
			rollout_turn = turn
			for _ in range(rollout_depth):
				if rollout_board.get_winner() is not None:
					break
				moves = self._legal_moves(rollout_board, rollout_turn)
				if not moves:
					score += 1 if rollout_turn != self.color else -1
					break
				rollout_board = self._next_board(rollout_board, choice(moves))
				rollout_turn = "B" if rollout_turn == "W" else "W"

			winner = rollout_board.get_winner()
			if winner == self.color:
				score += 1
			elif winner is not None:
				score -= 1
		return score

	def get_move(self, current_board):
		possible_moves = self._legal_moves(current_board, self.color)
		if not possible_moves:
			return None

		next_turn = "W" if self.color == "B" else "B"
		move_scores = []
		alpha = -999
		for move in possible_moves:
			aux_board = self._next_board(current_board, move)
			score = self.minimax(aux_board, False, 3, next_turn, alpha, 999)
			move_scores.append(score)
			alpha = max(alpha, score)

		best_score = max(move_scores)
		best_moves = [move for index, move in enumerate(possible_moves) if move_scores[index] == best_score]
		if len(best_moves) > 1:
			rollout_scores = [self.monte_carlo_score(self._next_board(current_board, move), next_turn) for move in best_moves]
			best_rollout = max(rollout_scores)
			best_moves = [move for index, move in enumerate(best_moves) if rollout_scores[index] == best_rollout]

		move_chosen = choice(best_moves)
		piece = current_board.get_pieces()[move_chosen["piece"]]
		return {"position_to": move_chosen["move"]["position"], "position_from": piece.get_position()}

	def get_value(self, board):
		winner = board.get_winner()
		if winner is not None:
			return 2 if winner == self.color else -2

		player_pieces = sum(piece.get_color() == self.color for piece in board.get_pieces())
		opponent_pieces = len(board.get_pieces()) - player_pieces
		if player_pieces == opponent_pieces:
			return 0
		return 1 if player_pieces > opponent_pieces else -1